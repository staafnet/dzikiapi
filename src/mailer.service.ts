import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    try {
      if (isDevelopment) {
        // Tryb development - używamy Ethereal
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`Created Ethereal test account: ${testAccount.user}`);
      } else {
        // Tryb produkcyjny - używamy SendGrid
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        this.logger.log('Initialized production SMTP transport');
      }

      // Weryfikacja połączenia
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transport', error);
      throw error;
    }
  }

  async sendMail(to: string, subject: string, text: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const isDevelopment = process.env.NODE_ENV !== 'production';
      const fromEmail = isDevelopment 
        ? 'dziki@ethereal.email' 
        : process.env.SMTP_FROM;
      const fromName = process.env.SMTP_FROM_NAME || 'Dziki Wschód';

      const mailOptions: Mail.Options = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Mail sent: ${info.messageId}`);

      // W trybie development pokazujemy link do podglądu
      if (isDevelopment && typeof nodemailer.getTestMessageUrl === 'function') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err) {
      this.logger.error('Mail send error', err);
      throw err;
    }
  }
}
