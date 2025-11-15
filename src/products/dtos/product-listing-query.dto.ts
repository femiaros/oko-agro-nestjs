import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProductApprovalStatus } from "../entities/product.entity";
import { Type } from "class-transformer";

export class ProductListingQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, enum: ProductApprovalStatus })
    @IsOptional()
    @IsEnum(ProductApprovalStatus)
    status?: ProductApprovalStatus; 

    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    pageNumber: number = 1;

    @ApiProperty({ required: false, default: 20 })
    @IsOptional()
    @Type(() => Number)
    pageSize: number = 20;
}