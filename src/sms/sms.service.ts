import { Injectable } from '@nestjs/common';
import { TwilioProvider } from './providers/twilio.provider';

@Injectable()
export class SmsService {
    constructor(private readonly provider: TwilioProvider) {}

    async send(to: string, message: string) {
        return this.provider.sendSms(to, message);
    }
}
