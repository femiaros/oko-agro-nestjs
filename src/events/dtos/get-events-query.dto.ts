import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEventsQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)', })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNumber?: number = 1;

    @ApiPropertyOptional({ example: 20, description: 'Page size (default: all records)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number;

    @ApiPropertyOptional({ example: true, description: 'Filter by harvest events' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isHarvestEvent?: boolean;
}