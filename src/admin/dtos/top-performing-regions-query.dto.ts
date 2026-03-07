import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TopPerformingRegionsQueryDto {
    @ApiPropertyOptional({
        example: 'Nigeria',
        description: "Filter by country",
    })
    @IsString()
    @IsOptional()
    country?: string;
}