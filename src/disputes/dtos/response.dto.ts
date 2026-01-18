import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { Dispute, DisputeStatus } from "../entities/dispute.entity";
import { ApiProperty } from "@nestjs/swagger";

export class DisputePaginationData {
    @ApiProperty({ type: () => [Dispute] })
    items: Dispute[];

    @ApiProperty({ example: 1000 })
    total: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;
}

export class ResolveDisputeData {
    @ApiProperty({ example: '823898-ye7uide-Rhj445-Ohshd6' })
    id: string;

    @ApiProperty({ example:  DisputeStatus.RESOLVED })
    status:  DisputeStatus.RESOLVED;

    @ApiProperty({ example: new Date() })
    resolvedAt: Date;
}

export class RejectedDisputeData {
    @ApiProperty({ example: '823898-ye7uide-Rhj445-Ohshd6' })
    id: string;

    @ApiProperty({ example:  DisputeStatus.REJECTED })
    status:  DisputeStatus.RESOLVED;

    @ApiProperty({ example: new Date() })
    resolvedAt: Date;
}

// export class DirectBuyRequestResponseData {
//     @ApiProperty({ example: "l89vuh-uhohou-gfyrf-5tgygv" })
//     id: string;

//     @ApiProperty({ example: "l89vuh-uhohou-gfyrf-5tgygv" })
//     sellerId: string;
// }

export class CreateDisputeResponseDto extends ApiResponseDto<Dispute> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Dispute raised successfully' })
    declare message: string;

    @ApiProperty({ type: () => Dispute })
    declare data: Dispute;
}

export class GetAllDisputesResponseDto extends ApiResponseDto<DisputePaginationData> {
    @ApiProperty({ example: 'Disputes retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => DisputePaginationData })
    declare data: DisputePaginationData;
}

export class GetDisputeResponseDto extends ApiResponseDto<Dispute> {
    @ApiProperty({ example: 'Dispute retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => Dispute })
    declare data: Dispute;
}

export class ResolveDisputeResponseDto extends ApiResponseDto<ResolveDisputeData> {
    @ApiProperty({ example: 'Dispute resolved successfully' })
    declare message: string;

    @ApiProperty({ type: () => ResolveDisputeData })
    declare data: ResolveDisputeData;
}

export class RejectDisputeResponseDto extends ApiResponseDto<RejectedDisputeData> {
    @ApiProperty({ example: 'Dispute rejected successfully' })
    declare message: string;

    @ApiProperty({ type: () => RejectedDisputeData })
    declare data: RejectedDisputeData;
}