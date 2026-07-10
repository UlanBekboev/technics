import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(email: string, password: string, name: string, phone?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Этот email уже зарегистрирован');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, phone },
    });

    return this.signToken(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Неверный email или пароль');

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone ?? undefined, role: user.role },
    };
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
  }

  async updateProfile(userId: number, data: { name?: string; phone?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      // Explicitly whitelisted — never spread the raw body into Prisma's
      // data here, `role` and other columns must stay out of reach.
      data: { name: data.name, phone: data.phone },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    return user;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('Неверный текущий пароль');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Пароль изменён' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Не раскрываем, существует ли email
    if (!user) return { message: 'Если такой email зарегистрирован, мы отправили код' };

    // Удаляем старые токены для этого email
    await this.prisma.passwordResetToken.deleteMany({ where: { email } });

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    await this.prisma.passwordResetToken.create({ data: { email, code, expiresAt } });
    await this.mail.sendPasswordResetCode(email, code);

    return { message: 'Если такой email зарегистрирован, мы отправили код' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const token = await this.prisma.passwordResetToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!token || token.code !== code) {
      throw new BadRequestException('Неверный код подтверждения');
    }

    if (token.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { id: token.id } });
      throw new BadRequestException('Код истёк, запросите новый');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    await this.prisma.passwordResetToken.deleteMany({ where: { email } });

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: number, email: string, role: string) {
    const token = this.jwt.sign({ sub: userId, email, role });
    return { access_token: token };
  }
}
