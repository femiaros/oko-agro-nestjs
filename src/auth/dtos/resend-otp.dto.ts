import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ResendOtpDto {
    @ApiProperty({ description: 'Provide userId' })
    @IsUUID('4', { message: 'Provide a valid userID' })
    userId: string;
}