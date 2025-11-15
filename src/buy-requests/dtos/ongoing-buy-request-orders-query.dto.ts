import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderState } from "../entities/buy-request.entity";
import { Type } from "class-transformer";

export class OngoingBuyRequestOrdersQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, enum: OrderState })
    @IsOptional()
    @IsEnum(OrderState)
    state?: OrderState;

    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    pageNumber: number = 1;

    @ApiProperty({ required: false, default: 20 })
    @IsOptional()
    @Type(() => Number)
    pageSize: number = 20;
}