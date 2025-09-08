import { IsUUID, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsUUID('4', { message: 'Provide a valid userID' })
  userId: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
