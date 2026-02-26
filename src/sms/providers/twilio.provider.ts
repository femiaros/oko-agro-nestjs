import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from '../interfaces/sms-provider.interface';
import Twilio from 'twilio';

@Injectable()
export class TwilioProvider implements SmsProvider {
    private client;

    constructor(private configService: ConfigService) {
        this.client = Twilio(
        this.configService.get('TWILIO_ACCOUNT_SID'),
        this.configService.get('TWILIO_AUTH_TOKEN'),
        );
    }

    async sendSms(to: string, message: string) {
        try {
            const response = await this.client.messages.create({
                body: message,
                from: this.configService.get('TWILIO_PHONE_NUMBER'),
                to,
            });

            return {
                success: true,
                messageId: response.sid,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}