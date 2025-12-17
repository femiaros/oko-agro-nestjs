import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';

export class GetNotificationsQueryDto {
    @ApiPropertyOptional({ description: 'Page number (starts from 1)', example: 1, default: 1  })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNumber: number = 1;

    @ApiPropertyOptional({ description: 'Number of records per page', example: 20,  default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize: number = 20;

    @ApiPropertyOptional({ enum: NotificationType, description: 'Filter by notification type', example: NotificationType.BuyRequest  })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @ApiPropertyOptional({description: 'Filter by read status',  example: false })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isRead?: boolean;
}