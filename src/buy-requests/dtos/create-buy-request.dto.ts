// create-buy-request.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
// import { ProductQuantityUnit } from 'src/products/enums/product-quantity-unit.enum';
import { BuyRequestQuantityUnit, PaymentMethod } from '../entities/buy-request.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuyRequestDto {
  @ApiProperty({ example: 'Offer to buy dhhdjw product', description: 'Short description of this request' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'c123-456-789', description: 'ID of crop type this request is for' })
  @IsUUID()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'q123-456-789', description: 'Quality standard ID (optional)', required: false })
  @IsUUID()
  @IsOptional()
  qualityStandardId?: string;

  @ApiProperty({ example: '1000', description: 'Quantity of product requested' })
  @IsNumberString()
  @IsNotEmpty()
  productQuantity: string;

  @ApiProperty({ enum: BuyRequestQuantityUnit, example: BuyRequestQuantityUnit.KILOGRAM, description: 'Quantity unit' })
  @IsEnum(BuyRequestQuantityUnit)
  productQuantityUnit: BuyRequestQuantityUnit;

  @ApiProperty({ example: '500', description: 'Price per unit offer (e.g. per kg)' })
  @IsString()
  @IsNotEmpty()
  pricePerUnitOffer: string;

  @ApiProperty({ example: '2025-10-01', description: 'Estimated delivery date (YYYY-MM-DD)' })
  @IsDateString()
  estimatedDeliveryDate: Date;

  @ApiProperty({ example: 'No 3 ojoau strt, Lagos, Nigeria', description: 'Delivery location' })
  @IsString()
  @IsNotEmpty()
  deliveryLocation: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PAY_ON_DELIVERY })
  @IsEnum(PaymentMethod)
  preferredPaymentMethod: PaymentMethod;

  @ApiProperty({ example: true, description: 'Whether request is visible to all farmers (true) or specific farmer (false)' })
  @IsBoolean()
  isGeneral: boolean;

  @ApiProperty({ example: 'u123-456-789', description: '(Optional) add seller-farmer ID if directed request', required: false })
  @IsUUID()
  @IsOptional()
  sellerId?: string; // when direct request

  @ApiProperty({ example: 'p123-456-789', description: '(Optional) product ID linked to the request', required: false })
  @IsUUID()
  @IsOptional()
  productId?: string; // product being referenced
}