import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductPhotosDto {
    @ApiProperty({ example: 'b123-456-789', description: 'ID of the product to update' })
    @IsString()
    @IsNotEmpty()
    productId: string; 

    @ApiProperty({ example: ["8hfeiweji9rfwjkowstring64","8hfeiweji9rfwjkowstring64"] , description: 'Atleast one product photo requested'})
    @IsArray()
    @ArrayMinSize(1, { message: 'At least 1 product photo is required' })
    @ArrayMaxSize(2, { message: 'At most 2 product photos are allowed' })
    @IsString({ each: true })
    photos: string[]; // base64 strings
}