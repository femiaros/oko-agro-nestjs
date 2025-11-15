import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";


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