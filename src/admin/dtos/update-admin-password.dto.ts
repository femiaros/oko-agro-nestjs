import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class UpdateAdminPasswordDto {
    @ApiProperty({ description: 'Provide user Id' })
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'Provide newPassword' })
    @IsString()
    newPassword: string;

    @ApiProperty({ description: 'Provide user confirmPassword' })
    @IsString()
    confirmPassword: string;    
}