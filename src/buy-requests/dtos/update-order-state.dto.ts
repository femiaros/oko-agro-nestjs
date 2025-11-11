import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderState } from '../entities/buy-request.entity';

export class UpdateOrderStateDto {
    @ApiProperty({
        example: '3bfb2b2a-1d11-4b26-9124-3c5f9d1a4d8e',
        description: 'The ID of the BuyRequest whose order state is being updated',
    })
    @IsString()
    @IsNotEmpty()
    buyRequestId: string;

    @ApiProperty({
        enum: OrderState,
        example: OrderState.IN_TRANSIT,
        description: 'The new order state to set for this buy request',
    })
    @IsEnum(OrderState)
    @IsNotEmpty()
    orderState: OrderState;
}