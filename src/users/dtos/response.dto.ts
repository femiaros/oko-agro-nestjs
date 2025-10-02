import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
import { ApiResponseDto } from "src/common/dto/api-response.dto";


export class UsersPaginationData {
    @ApiProperty({ type: () => [User] })
    items: User[];

    @ApiProperty({ example: 1000 })
    totalRecord: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;
}

export class ProcessorListResponseDto extends ApiResponseDto<UsersPaginationData> {
    @ApiProperty({ example: 'Processor user(s) fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => UsersPaginationData })
    declare data: UsersPaginationData;
}

export class FarmerListResponseDto extends ApiResponseDto<UsersPaginationData> {
    @ApiProperty({ example: 'Farmer user(s) fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => UsersPaginationData })
    declare data: UsersPaginationData;
}

export class UserFindResponseDto extends ApiResponseDto<User> {
    @ApiProperty({ example: 'User fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => User })
    declare data: User;
}