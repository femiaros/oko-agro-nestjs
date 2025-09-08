import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or use 'smtp' + host/port/auth
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<{ success: boolean; message: string }> {
    const mailOptions = {
      from: `"OkoAgro" <${"oko@agro.ng"}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully to ${to}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      return { success: false, message: 'Failed to send email' };
    }
  }
}