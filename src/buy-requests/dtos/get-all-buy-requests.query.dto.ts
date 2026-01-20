import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumberString, IsOptional } from "class-validator";

export class GetAllBuyRequestsQueryDto {
    @ApiPropertyOptional({
        description: 'Filter general buy requests',
        example: true,
        default: true,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isGeneral?: boolean = true;

    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @IsNumberString()
    pageNumber?: string;

    @ApiPropertyOptional({
        description: 'Page size',
        example: 20,
        default: 20,
    })
    @IsOptional()
    @IsNumberString()
    pageSize?: string;
}