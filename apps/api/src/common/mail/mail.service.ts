import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT', '587'));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendMail(options: { to: string; subject: string; text: string; html?: string }) {
    const from = this.config.get<string>('SMTP_FROM', this.config.get<string>('SMTP_USER', 'noreply@favorit-kzn.ru'));

    if (!this.transporter) {
      this.logger.log(`[Email dev] To: ${options.to}\nSubject: ${options.subject}\n${options.text}`);
      return { sent: false, dev: true };
    }

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, '<br>'),
    });

    return { sent: true };
  }
}
