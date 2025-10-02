import { ApiProperty } from "@nestjs/swagger";
import { instanceToPlain } from "class-transformer";

export class ApiResponseDto<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Request successful' })
    message: string;

    @ApiProperty({ type: () => Object, required: false })
    data?: T;

    constructor(statusCode: number, message: string, data?: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data ? instanceToPlain(data) as T : undefined;
    }
}