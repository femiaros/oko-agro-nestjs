import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductPhotosDto {
    @IsString()
    @IsNotEmpty()
    productId: string; 

    @IsArray()
    @ArrayMinSize(1, { message: 'At least 1 product photo is required' })
    @ArrayMaxSize(2, { message: 'At most 2 product photos are allowed' })
    @IsString({ each: true })
    photos: string[]; // base64 strings
}