import { IsString, IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginUserDto {
    @IsEmail({}, {message: 'Provide a valid email'})
    email: string;

    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(7, {message: 'Password must be at least 7 characters long'})
    password: string;
}