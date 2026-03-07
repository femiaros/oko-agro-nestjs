import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { UsersPaginationData } from "src/users/dtos/response.dto";

class TopUserData {
    @ApiProperty({ example: '11e98165-0530-489c-9b1a-d8359da59536' })
    id: string;

    @ApiProperty({ example: 'john doe' })
    name: string;

    @ApiProperty({ example: 'farmer' })
    role: string;

    @ApiProperty({ example: '1345008.00' })
    performanceAmount: string;

    @ApiProperty({ example: 'nigeria' })
    country: string;

    @ApiProperty({ example: 6 })
    ordersCompleted: number;
}

class TopRegionData {
    @ApiProperty({ example: 'Lagos' })
    state: string;

    @ApiProperty({ example: 'Nigeria' })
    country: string;

    @ApiProperty({ example: '99345080.00' })
    totalCompletedAmount: string;

    @ApiProperty({ example: 2000 })
    totalUsers: number;
}

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

export class TopPerformingUserDataDto {
    @ApiProperty({ type: () => [TopUserData] })
    users: TopUserData[];

    @ApiProperty({ example: 10 })
    totalRecord: number;
}

export class TopPerformingRegionDataDto {
    @ApiProperty({ type: () => [TopRegionData] })
    regions: TopRegionData[];

    @ApiProperty({ example: 10 })
    totalRecord: number;
}

export class DashboardOverviewResponseDto extends ApiResponseDto<DashboardOverviewDataDto> {
    @ApiProperty({ example: 'Dashboard stats fetched successfully' })
    declare message: string;

    @ApiProperty({ type: DashboardOverviewDataDto })
    declare data: DashboardOverviewDataDto;
}

export class TopPerformingUsersResponseDto extends ApiResponseDto<TopPerformingUserDataDto> {
    @ApiProperty({ example: 'Top performing users fetched successfully' })
    declare message: string;

    @ApiProperty({ type: TopPerformingUserDataDto })
    declare data: TopPerformingUserDataDto;
}

export class TopPerformingRegionsResponseDto extends ApiResponseDto<TopPerformingRegionDataDto> {
    @ApiProperty({ example: 'Top performing regions fetched successfully' })
    declare message: string;

    @ApiProperty({ type: TopPerformingRegionDataDto })
    declare data: TopPerformingRegionDataDto;
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