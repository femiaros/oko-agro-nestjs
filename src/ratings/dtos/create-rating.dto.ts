import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateRatingDto {
    @ApiProperty({
        example: 'a12f4c1e-7c09-4c21-9b9f-cc4b9c7e4d11',
        description: 'BuyRequest ID the rating is associated with',
    })
    @IsUUID()
    buyRequestId: string;

    @ApiProperty({
        example: 4,
        description: 'Rating score (1 to 5)',
        minimum: 1,
        maximum: 5,
    })
    @IsInt()
    @Min(1)
    @Max(5)
    score: number;

    @ApiProperty({
        example: 'Smooth transaction and good communication',
        description: 'Optional rating comment',
        required: false,
    })
    @IsOptional()
    @IsString()
    comment?: string;
}