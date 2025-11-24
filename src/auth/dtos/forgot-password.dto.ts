import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Provide user email' })
  @IsEmail({}, { message: 'Provide a valid email' })
  @IsNotEmpty()
  email: string;
}
