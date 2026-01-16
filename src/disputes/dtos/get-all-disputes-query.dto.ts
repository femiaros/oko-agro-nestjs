import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { DisputeStatus } from 'src/disputes/entities/dispute.entity';

export class GetAllDisputesQueryDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @IsNumberString()
    pageNumber?: string;

    @ApiPropertyOptional({
        description: 'Number of records per page',
        example: 20,
        default: 20,
    })
    @IsOptional()
    @IsNumberString()
    pageSize?: string;

    @ApiPropertyOptional({
        enum: DisputeStatus,
        description: 'Filter disputes by status',
        example: DisputeStatus.OPEN,
    })
    @IsOptional()
    @IsEnum(DisputeStatus)
    status?: DisputeStatus;

    @ApiPropertyOptional({
        description: 'Search by dispute ID or reason or resolvedBy name',
        example: 'quality',
    })
    @IsOptional()
    @IsString()
    search?: string;
}