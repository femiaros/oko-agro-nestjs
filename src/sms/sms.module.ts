import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { TwilioProvider } from './providers/twilio.provider';

@Module({
  providers: [SmsService, TwilioProvider],
  exports: [SmsService],
})
export class SmsModule {}
