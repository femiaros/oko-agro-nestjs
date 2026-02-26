import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductInventoryType } from '../entities/product-inventory.entity';

export class GetInventoriesQueryDto {

    @ApiPropertyOptional({
        description: 'Search by product name or crop type name',
        example: 'maize',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by inventory log type',
        enum: ProductInventoryType,
        example: ProductInventoryType.ADDITION,
    })
    @IsOptional()
    @IsEnum(ProductInventoryType)
    type?: ProductInventoryType;

    @ApiPropertyOptional({
        description: 'Page number (default: 1)',
        example: '1',
        default: '1',
    })
    @IsOptional()
    @IsString()
    pageNumber?: string = '1';

    @ApiPropertyOptional({
        description: 'Page size (default: 20)',
        example: '20',
        default: '20',
    })
    @IsOptional()
    @IsString()
    pageSize?: string = '20';
}