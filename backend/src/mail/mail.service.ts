import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend | null = null;
  private from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const raw = process.env.RESEND_API_KEY || this.config.get<string>('RESEND_API_KEY') || 're_2neuwP9Z_A4i2Jjo1nQXW74wd93tKuyct';
    const apiKey = raw.replace(/^["']|["']$/g, '').trim();
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service enabled');
    } else {
      this.logger.warn('RESEND_API_KEY not set — email sending is disabled');
    }
    const fromRaw = process.env.MAIL_FROM || this.config.get<string>('MAIL_FROM') || '';
    this.from = fromRaw.replace(/^["']|["']$/g, '').trim() || 'Technics <onboarding@resend.dev>';
  }

  private get isEnabled(): boolean {
    return this.resend !== null;
  }

  async sendOrderConfirmation(to: string, order: any, userName: string): Promise<void> {
    if (!this.isEnabled) return;
    const itemRows = order.items
      .map(
        (i: any) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${i.product.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:14px;">${i.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;color:#111827;font-size:14px;">${(Number(i.price) * i.quantity).toLocaleString('ru')} сом</td>
        </tr>`,
      )
      .join('');

    const { error } = await this.resend!.emails.send({
      from: this.from,
      to,
      subject: `Заказ #${order.id} принят — Technics`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg,#003d8f,#0077e6);border-radius:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-size:22px;font-weight:900;line-height:48px;display:block;text-align:center;">T</span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px;">Ваш заказ принят!</h1>
          <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Здравствуйте, ${userName}! Мы получили ваш заказ и скоро свяжемся с вами для подтверждения.</p>

          <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Номер заказа</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#111827;">#${order.id}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Товар</th>
                <th style="text-align:center;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Кол-во</th>
                <th style="text-align:right;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Сумма</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="display:flex;justify-content:space-between;align-items:center;background:#f9fafb;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
            <span style="font-size:14px;font-weight:600;color:#374151;">Итого:</span>
            <span style="font-size:20px;font-weight:800;color:#E53E3E;">${Number(order.total).toLocaleString('ru')} сом</span>
          </div>

          ${order.address ? `<p style="color:#6b7280;font-size:13px;margin:0 0 6px;">📍 <strong>Адрес:</strong> ${order.address}</p>` : ''}
          ${order.comment ? `<p style="color:#6b7280;font-size:13px;margin:0 0 6px;">💬 <strong>Комментарий:</strong> ${order.comment}</p>` : ''}

          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;border-top:1px solid #f3f4f6;padding-top:16px;">
            Technics — интернет-магазин электроники в Бишкеке<br>
            +996 700 916 121 · +996 551 916 122
          </p>
        </div>
      `,
    });

    if (error) this.logger.error(`Order confirmation failed: ${JSON.stringify(error)}`);
  }

  async sendNewOrderAlert(adminEmail: string, order: any, user: any): Promise<void> {
    if (!this.isEnabled) return;
    const lines = order.items
      .map((i: any) => `• ${i.product.name} × ${i.quantity} — ${(Number(i.price) * i.quantity).toLocaleString('ru')} сом`)
      .join('<br>');

    const { error } = await this.resend!.emails.send({
      from: this.from,
      to: adminEmail,
      subject: `🛒 Новый заказ #${order.id} на ${Number(order.total).toLocaleString('ru')} сом`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
          <h1 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 16px;">🛒 Новый заказ #${order.id}</h1>

          <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:13px;"><strong>Клиент:</strong> ${user?.name ?? '—'}</p>
            <p style="margin:0 0 6px;font-size:13px;"><strong>Email:</strong> ${user?.email ?? '—'}</p>
            ${user?.phone ? `<p style="margin:0;font-size:13px;"><strong>Телефон:</strong> ${user.phone}</p>` : ''}
          </div>

          ${order.address ? `<p style="font-size:13px;color:#374151;margin:0 0 6px;">📍 <strong>Адрес:</strong> ${order.address}</p>` : ''}
          ${order.comment ? `<p style="font-size:13px;color:#374151;margin:0 0 16px;">💬 <strong>Комментарий:</strong> ${order.comment}</p>` : ''}

          <p style="font-size:13px;color:#374151;margin:0 0 8px;"><strong>Состав заказа:</strong></p>
          <p style="font-size:13px;color:#6b7280;line-height:1.8;margin:0 0 16px;">${lines}</p>

          <div style="background:#003d8f;color:#fff;border-radius:8px;padding:14px 20px;text-align:center;">
            <span style="font-size:18px;font-weight:800;">Итого: ${Number(order.total).toLocaleString('ru')} сом</span>
          </div>
        </div>
      `,
    });

    if (error) this.logger.error(`Admin order alert failed: ${JSON.stringify(error)}`);
  }

  async sendPasswordResetCode(to: string, code: string): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn(`Password reset code for ${to}: ${code} (email disabled)`);
      return;
    }
    const { error } = await this.resend!.emails.send({
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
