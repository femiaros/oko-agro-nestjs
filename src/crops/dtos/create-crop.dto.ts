import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCropDto{
    @ApiProperty({ example: 'Guava', description: 'Name of crop' })
    @IsString()
    @IsNotEmpty({message: 'name is required'})
    @MinLength(2, {message: 'name must be at least 2 characters long'})
    name: string;
}