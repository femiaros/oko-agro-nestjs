import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateUserStatusDto {
    @ApiProperty({ description: 'Provide user Id' })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isDisabled: boolean;
}