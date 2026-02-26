import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, ArrayMinSize, ArrayMaxSize, MinDate } from 'class-validator';
import { ProductPriceCurrency } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Sweet kidney beans', description: 'Name of event' })
  @IsString()
  @IsNotEmpty({message: 'name is required'})
  name: string;

  @ApiProperty({ example: 'q123-456-789', description: 'Crop ID (optional)' })
  @IsString()
  @IsNotEmpty({message: 'cropId is required'})
  cropId: string; // link to Crop

  @ApiProperty({ example: '1000', description: 'Quantity of product requested (optional)' })
  @IsNumberString()
  @IsNotEmpty({message: 'quantity is required'})
  quantityKg: string;

  @ApiProperty({ example: '500', description: 'Price per unit offer (e.g. per kg) (optional)' })
  @IsNumberString()
  @IsNotEmpty({message: 'pricePerKg is required'})
  pricePerKg: string;

  @ApiProperty({ enum: ProductPriceCurrency, example: ProductPriceCurrency.NGN, description: 'Price Currency (optional)' })
  @IsEnum(ProductPriceCurrency)
  @IsOptional()
  priceCurrency?: ProductPriceCurrency;

  @ApiProperty({ example: '2025-10-01', description: 'harvestDate (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  harvestDate?: Date;

  @ApiProperty({ example: 'No 3 ojoau strt, Lagos, Nigeria', description: 'Location address (optional)' })
  @IsString()
  @IsNotEmpty({message: 'locationAddress is required'})
  locationAddress: string;

  @ApiProperty({ example: ["8hfeiweji9rfwjkowstring64","8hfeiweji9rfwjkowstring64"] , description: 'Two product photos requested'})
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 product photos are required' })
  @ArrayMaxSize(2, { message: 'At most 2 product photos are allowed' })
  @IsString({ each: true })
  photos: string[]; // base64 strings
}