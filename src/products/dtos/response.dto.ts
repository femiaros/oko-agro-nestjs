import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { Product } from "../entities/product.entity";

export class ProductPaginationData {
    @ApiProperty({ type: () => [Product] })
    items: Product[];

    @ApiProperty({ example: 1000 })
    totalRecord: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;
}

export class ProductApprovalStatusResponseDto extends ApiResponseDto<Product> {
    @ApiProperty({ example: 'Product approved successfully' })
    declare message: string;

    @ApiProperty({ type: () => Product })
    declare data: Product;
}

export class ProductListingsResponseDto extends ApiResponseDto<ProductPaginationData> {
    @ApiProperty({ example: 'Product listings fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => ProductPaginationData })
    declare data: ProductPaginationData;
}

export class ProductFindByUserIdResponseDto extends ApiResponseDto<Product[]> {
    @ApiProperty({ example: 'User product(s) fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => [Product] })
    declare data: Product[];
}

export class ProductApprovedFindByUserIdResponseDto extends ApiResponseDto<Product[]> {
    @ApiProperty({ example: 'Approved product(s) fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => [Product] })
    declare data: Product[];
}