import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateAdminUserDto {
    @ApiProperty({ description: 'Provide adin-user firstName' })
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'Provide adin-user lastName' })
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'Provide adin-user email' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Provide adin-user phoneNumber' })
    @IsString()
    phoneNumber: string;
}