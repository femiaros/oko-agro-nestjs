import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
    @ApiProperty({
        example: 'a3c9d6e2-9a1d-4f63-9e10-92f42d94e7a1',
        description: 'BuyRequest ID the dispute is raised for',
    })
    @IsUUID()
    buyRequestId: string;

    @ApiProperty({
        example: 'Product quality did not meet agreement',
        description: 'Reason for raising the dispute',
    })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
