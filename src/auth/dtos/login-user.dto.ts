import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ description: 'Provide user account email' })
    @IsEmail({}, {message: 'Provide a valid email'})
    email: string;

    @ApiProperty({ description: 'Provide user account password' })
    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    // @MinLength(7, {message: 'Password must be at least 7 characters long'})
    password: string;
}