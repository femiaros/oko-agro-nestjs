import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Provide userId' })
  @IsUUID('4', { message: 'Provide a valid userID' })
  userId: string;

  @ApiProperty({ description: 'Provide otp' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
