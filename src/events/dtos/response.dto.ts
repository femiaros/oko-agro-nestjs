import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";

export class EventPaginationData {
    @ApiProperty({ type: () => [Event] })
    items: Event[];

    @ApiProperty({ example: 1000 })
    totalRecord: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;
}

export class EventCreateResponseDto extends ApiResponseDto<Event> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Event created successfully' })
    declare message: string;

    @ApiProperty({ type: () => Event })
    declare data: Event;
}

export class EventUpdateResponseDto extends ApiResponseDto<Event> {
    @ApiProperty({ example: 'Event updated successfully' })
    declare message: string;

    @ApiProperty({ type: () => Event })
    declare data: Event;
}

export class EventFindResponseDto extends ApiResponseDto<Event> {
    @ApiProperty({ example: 'Event fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => Event })
    declare data: Event;
}

export class EventUserListResponseDto extends ApiResponseDto<Event[]> {
    @ApiProperty({ example: 'User events fetched successfully' })
    declare message: string;

    @ApiProperty({ type: () => Event })
    declare data: Event[];
}

export class EventDeleteResponseDto {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Event deleted successfully' })
    declare message: string;
}

export class GetEventsResponseDto extends ApiResponseDto<EventPaginationData> {
    @ApiProperty({ example: 'Events retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => EventPaginationData })
    declare data: EventPaginationData;
}