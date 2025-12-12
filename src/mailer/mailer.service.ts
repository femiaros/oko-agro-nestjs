import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend;
  private fromEmail: string;

  onModuleInit() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set in environment variables');
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!from) {
      this.logger.error('RESEND_FROM_EMAIL is not set in environment variables');
      throw new Error('RESEND_FROM_EMAIL is not configured');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = from;
    this.logger.log('Resend MailerService initialized');
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // `emails.send` returns a promise; adjust if your Resend SDK version returns different shape
      const result = await this.resend.emails.send({
        from: this.fromEmail, // guaranteed to be set in onModuleInit
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`✅ Email sent to ${to}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error?.message ?? String(error)}`);
      return { success: false, message: `Failed to send email: ${error?.message ?? 'unknown error'}` };
    }
  }
}
