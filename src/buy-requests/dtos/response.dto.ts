import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { BuyRequest } from "../entities/buy-request.entity";

export class BuyRequestPaginationData {
    @ApiProperty({ type: () => [BuyRequest] })
    items: BuyRequest[];

    @ApiProperty({ example: 1000 })
    totalRecord: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;
}

export class BuyRequestCreateResponseDto extends ApiResponseDto<BuyRequest> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'BuyRequest created successfully!' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequest })
    declare data: BuyRequest;
}

export class BuyRequestUpdateResponseDto extends ApiResponseDto<BuyRequest> {
    @ApiProperty({ example: 'Buy request updated successfully!' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequest })
    declare data: BuyRequest;
}

export class BuyRequestUpdateStatusResponseDto extends ApiResponseDto<BuyRequest> {
    @ApiProperty({ example: 'BuyRequest status updated successfully' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequest })
    declare data: BuyRequest;
}

export class BuyRequestUpdateOrderStateResponseDto extends ApiResponseDto<BuyRequest> {
    @ApiProperty({ example: 'Order state updated to awaiting_shipping' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequest })
    declare data: BuyRequest;
}

export class BuyRequestGeneralListResponseDto extends ApiResponseDto<BuyRequest[]> {
    @ApiProperty({ example: 'General buy requests fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => [BuyRequest] })
    declare data: BuyRequest[];
}

export class BuyRequestListResponseDto extends ApiResponseDto<BuyRequestPaginationData> {
    @ApiProperty({ example: 'Buy requests fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequestPaginationData })
    declare data: BuyRequestPaginationData;
}

export class BuyRequestFindResponseDto extends ApiResponseDto<BuyRequest> {
    @ApiProperty({ example: 'BuyRequest fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => BuyRequest })
    declare data: BuyRequest;
}

export class BuyRequestFindByUserIdResponseDto extends ApiResponseDto<BuyRequest[]> {
    @ApiProperty({ example: 'User buy requests fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => [BuyRequest] })
    declare data: BuyRequest[];
}

export class BuyRequestDeleteResponseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: "BuyRequest deleted successfully" })
    message: string;
}