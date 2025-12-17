import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ContactBuyerDto {
    @ApiProperty({ example: '24a3e7b0-c0f3-4960-8174-3f756db43eec', description: 'BuyRequest ID' })
    @IsUUID()
    buyRequestId: string;

    @ApiProperty({ example: 'f3cef9e7-96e7-4105-afef-85e4dfb26f1f', description: 'Processor (buyer) userId' })
    @IsUUID()
    processorId: string;

    @ApiProperty({ example: 'I have cocoa beans ready for supply', required: false })
    @IsOptional()
    @IsString()
    message?: string;
}