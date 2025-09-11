import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Provide a valid email' })
  @IsNotEmpty()
  email: string;
}
