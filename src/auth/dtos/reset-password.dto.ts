import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Provide user resetToken' })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({ description: 'Provide user newPassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;

  @ApiProperty({ description: 'Provide user confirmPassword' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
