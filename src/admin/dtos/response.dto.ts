import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { UsersPaginationData } from "src/users/dtos/response.dto";

export class DashboardOverviewDataDto {
    @ApiProperty({ example: 176 })
    totalUsers: number;

    @ApiProperty({ example: 13250000 })
    totalTransactionValue: number;

    @ApiProperty({ example: 420 })
    completedOrders: number;

    @ApiProperty({ example: 12 })
    pendingListings: number;
}

export class DashboardOverviewResponseDto extends ApiResponseDto<DashboardOverviewDataDto> {
    @ApiProperty({ example: 'Dashboard stats fetched successfully' })
    declare message: string;

    @ApiProperty({ type: DashboardOverviewDataDto })
    declare data: DashboardOverviewDataDto;
}

export class CreateAdminData {
    @ApiProperty({ example: "8hfeiweji9rfwjkowstring64" })
    id: string;
}

export class CreateAdminResponseDto extends ApiResponseDto<CreateAdminData> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Admin user created successfully' })
    declare message: string;

    @ApiProperty({ type: () => CreateAdminData })
    declare data: CreateAdminData;
}

export class UpdateUserResponseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: "User has been disabled successfully" })
    message: string;
}

export class UpdateAdminPwdResponseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: "Password updated successfully" })
    message: string;
}

export class DeleteAdminResponseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: "Admin user deleted successfully" })
    message: string;
}

export class GetAdminsResponseDto extends ApiResponseDto<UsersPaginationData> {
    @ApiProperty({ example: 'Admin(s) fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => UsersPaginationData })
    declare data: UsersPaginationData;
}