import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";

export class UserRatingsBreakdownDto {
    @ApiProperty({ example: 15 })
    '5': number;

    @ApiProperty({ example: 5 })
    '4': number;

    @ApiProperty({ example: 2 })
    '3': number;

    @ApiProperty({ example: 1 })
    '2': number;

    @ApiProperty({ example: 0 })
    '1': number;
}

export class UserRatingsStatsData {
    @ApiProperty({ example: 4.6 })
    average: number;

    @ApiProperty({ example: 23 })
    total: number;

    @ApiProperty({ type: () => UserRatingsBreakdownDto })
    breakdown: UserRatingsBreakdownDto;
}

export class CreateRatingData {
    @ApiProperty({ example: '823898-ye7uide-Rhj445-Ohshd6' })
    id: string;

    @ApiProperty({ example: 4 })
    score: number;

    @ApiProperty({ example: 'Smooth transaction and good communication' })
    comment: string;

    @ApiProperty({ example: new Date() })
    createdAt: Date;
}

export class CreateRatingResponseDto extends ApiResponseDto<CreateRatingData> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Rating created successfully' })
    declare message: string;

    @ApiProperty({ type: () => CreateRatingData })
    declare data: CreateRatingData;
}

export class UserRatingsStatsResponseDto extends ApiResponseDto<UserRatingsStatsData> {
    @ApiProperty({ example: 'User rating statistics retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => UserRatingsStatsData })
    declare data: UserRatingsStatsData;
}    