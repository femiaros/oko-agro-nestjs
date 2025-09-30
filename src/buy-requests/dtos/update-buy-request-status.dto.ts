import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BuyRequestStatus } from '../entities/buy-request.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBuyRequestStatusDto {
    @ApiProperty({ example: 'b123-456-789', description: 'ID of the buy request to update' })
    @IsUUID()
    @IsNotEmpty()
    buyRequestId: string;

    @ApiProperty({ enum: BuyRequestStatus, example: BuyRequestStatus.ACCEPTED })
    @IsEnum(BuyRequestStatus)
    @IsNotEmpty()
    status: BuyRequestStatus;

    @ApiProperty({
        example: 'p123-456-789',
        description: 'Product ID farmer is accepting request with: (required when general request is accepted)',
        required: false,
    })
    @IsUUID()
    @IsOptional()
    productId?: string; // Only required if farmer is accepting a general request
}