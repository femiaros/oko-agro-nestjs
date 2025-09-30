import { IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID } from "class-validator";
import { ProductQuantityUnit } from "src/products/entities/product.entity";
import { BuyRequestQuantityUnit, PaymentMethod } from "../entities/buy-request.entity";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBuyRequestDto {
    @ApiProperty({ example: 'q123-456-789', description: 'BuyRequest ID'})
    @IsUUID()
    @IsNotEmpty()
    buyRequestId: string;

    @ApiProperty({ example: 'Offer to buy', description: 'Short description of this request (optional)', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'q123-456-789', description: 'Quality standard ID (optional)', required: false })
    @IsUUID()
    @IsOptional()
    qualityStandardId?: string;

    @ApiProperty({ example: '1000', description: 'Quantity of product requested (optional)', required: false })
    @IsNumberString()
    @IsOptional()
    productQuantity?: string;

    @ApiProperty({ enum: BuyRequestQuantityUnit, example: BuyRequestQuantityUnit.KILOGRAM, description: 'Quantity unit (optional)', required: false })
    @IsEnum(BuyRequestQuantityUnit)
    @IsOptional()
    productQuantityUnit?: BuyRequestQuantityUnit;

    @ApiProperty({ example: '500', description: 'Price per unit offer (e.g. per kg) (optional)', required: false })
    @IsNumberString()
    @IsOptional()
    pricePerUnitOffer?: string;

    @ApiProperty({ example: '2025-10-01', description: 'Estimated delivery date (YYYY-MM-DD) (optional)', required: false })
    @IsDateString()
    @IsOptional()
    estimatedDeliveryDate?: Date;

    @ApiProperty({ example: 'No 3 ojoau strt, Lagos, Nigeria', description: 'Delivery location (optional)', required: false })
    @IsString()
    @IsOptional()
    deliveryLocation?: string;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PAY_ON_DELIVERY, description: 'PaymentMethod (optional)', required: false})
    @IsEnum(PaymentMethod)
    @IsOptional()
    preferredPaymentMethod?: PaymentMethod;
}
