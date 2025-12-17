import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DirectBuyRequestDto {
    @ApiProperty({
        example: '83b07606-5c78-4bf1-8bdc-ba685e739f79',
        description: 'Preferred seller (farmer) userId',
    })
    @IsUUID()
    sellerId: string;
}
