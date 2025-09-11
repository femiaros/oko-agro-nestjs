import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCertificationDto{
    @IsString()
    @IsNotEmpty({message: 'name is required'})
    @MinLength(2, {message: 'name must be at least 2 characters long'})
    name: string;
}