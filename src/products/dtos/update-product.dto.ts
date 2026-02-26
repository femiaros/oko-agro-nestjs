import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ProductPriceCurrency } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'q123-456-789', description: 'Product ID'})
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Sweet kidney beans', description: 'name of product (optional)', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  // @ApiProperty({ example: 'q123-456-789', description: 'Crop ID (optional)', required: false })
  // @IsString()
  // @IsOptional() 
  // cropId?: string; // link to Crop

  @ApiProperty({ example: '1000', description: 'Quantity of product requested (optional)', required: false })
  @IsNumberString()
  @IsOptional()
  quantityKg?: string;

  @ApiProperty({ example: '500', description: 'Price per kg offer (e.g. per kg) (optional)', required: false })
  @IsNumberString()
  @IsOptional()
  pricePerKg?: string;

  @ApiProperty({ enum: ProductPriceCurrency, example: ProductPriceCurrency.NGN, description: 'Price Currency (optional)', required: false })
  @IsEnum(ProductPriceCurrency)
  @IsOptional()
  priceCurrency?: ProductPriceCurrency;

  @ApiProperty({ example: 'No 3 ojoau strt, Lagos, Nigeria', description: 'Location address (optional)', required: false })
  @IsString()
  @IsOptional()
  locationAddress?: string;
}
