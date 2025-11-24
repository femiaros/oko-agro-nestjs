import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";

export class registerUserData {
    @ApiProperty({ example: "8hfeiweji9rfwjkowstring64" })
    id: string;
}

export class registerUserResponseDto extends ApiResponseDto<registerUserData> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Registration completed, verification OTP sent successfully!' })
    declare message: string;

    @ApiProperty({ type: () => registerUserData })
    declare data: registerUserData;
}