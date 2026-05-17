import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
    this.from = this.config.get<string>('MAIL_FROM') || 'Technics <noreply@technics.store>';
  }

  async sendPasswordResetCode(to: string, code: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Код для сброса пароля — Technics',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#003d8f,#0077e6);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
            <span style="color:#fff;font-size:22px;font-weight:900;line-height:48px;display:block;text-align:center;">T</span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">Сброс пароля</h1>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Введите этот код на странице восстановления пароля. Код действителен 15 минут.</p>
          <div style="background:#f3f4f6;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#111827;">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;">Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send reset code to ${to}: ${JSON.stringify(error)}`);
      throw new Error('Не удалось отправить письмо');
    }
  }
}
