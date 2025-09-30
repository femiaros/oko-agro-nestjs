import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ProductPriceCurrency, ProductQuantityUnit } from '../entities/product.entity';
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
  quantity?: string;

  @ApiProperty({ enum: ProductQuantityUnit, example: ProductQuantityUnit.KILOGRAM, description: 'Quantity unit (optional)', required: false })
  @IsEnum(ProductQuantityUnit)
  @IsOptional()
  quantityUnit?: ProductQuantityUnit;

  @ApiProperty({ example: '500', description: 'Price per unit offer (e.g. per kg) (optional)', required: false })
  @IsNumberString()
  @IsOptional()
  pricePerUnit?: string;

  @ApiProperty({ enum: ProductPriceCurrency, example: ProductPriceCurrency.NGN, description: 'Price Currency (optional)', required: false })
  @IsEnum(ProductPriceCurrency)
  @IsOptional()
  priceCurrency?: ProductPriceCurrency;

  @ApiProperty({ example: 'No 3 ojoau strt, Lagos, Nigeria', description: 'Location address (optional)', required: false })
  @IsString()
  @IsOptional()
  locationAddress?: string;
}
