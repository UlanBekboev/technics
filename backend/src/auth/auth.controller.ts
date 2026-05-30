import { Controller, Post, Patch, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private mail: MailService,
  ) {}

  @Get('mail-debug')
  mailDebug() {
    const key = process.env.RESEND_API_KEY || '';
    const clean = key.replace(/^["']|["']$/g, '').trim();
    return {
      RESEND_API_KEY: clean ? `"${clean.slice(0, 6)}..." (length: ${clean.length})` : '❌ NOT SET',
      MAIL_FROM: process.env.MAIL_FROM || '(not set, will use default)',
      mail_enabled: clean.length > 0,
    };
  }

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; phone?: string }) {
    return this.auth.register(body.email, body.password, body.name, body.phone);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.auth.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: { name?: string; phone?: string }) {
    return this.auth.updateProfile(req.user.userId, body);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.auth.changePassword(req.user.userId, body.oldPassword, body.newPassword);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { email: string; code: string; password: string }) {
    return this.auth.resetPassword(body.email, body.code, body.password);
  }
}
