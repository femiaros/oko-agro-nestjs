import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ProductPriceCurrency, ProductQuantityUnit } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({message: 'name is required'})
  name: string;

  @IsString()
  @IsNotEmpty({message: 'cropId is required'})
  cropId: string; // link to Crop

  @IsNumberString()
  @IsNotEmpty({message: 'quantity is required'})
  quantity: string;

  @IsEnum(ProductQuantityUnit)
  quantityUnit: ProductQuantityUnit;

  @IsNumberString()
  @IsNotEmpty({message: 'pricePerUnit is required'})
  pricePerUnit: string;

  @IsEnum(ProductPriceCurrency)
  @IsOptional()
  priceCurrency?: ProductPriceCurrency;

  @IsDateString()
  @IsOptional()
  harvestDate?: Date;

  @IsString()
  @IsNotEmpty({message: 'locationAddress is required'})
  locationAddress: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 product photos are required' })
  @ArrayMaxSize(2, { message: 'At most 2 product photos are allowed' })
  @IsString({ each: true })
  photos: string[]; // base64 strings
}