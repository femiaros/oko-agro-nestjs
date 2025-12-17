import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";

export class NotificationData {
    @ApiProperty({ example: 'uxuui-67uhdjd-uhdjikd-772829' })
    id: string;

    @ApiProperty({ example: 'buy_request' })
    type: string;

    @ApiProperty({ example: 'Buy Request Accepted' })
    title: string;

    @ApiProperty({ example: 'Your buy request has been accepted' })
    message: string;

    @ApiProperty({ example: 'uxuui-67uhdjd-uhdjikd-772829' })
    senderId: string;

    @ApiProperty({ example: 'John Doe' })
    senderName: string;

    @ApiProperty({ example: false })
    isRead: boolean;

    @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
    updatedAt: string;
}

export class NotificationPaginationData {
    @ApiProperty({ type: () => [NotificationData] })
    items: NotificationData[];

    @ApiProperty({ example: 12 })
    totalRecord: number;

    @ApiProperty({ example: 1 })
    pageNumber: number;

    @ApiProperty({ example: 20 })
    pageSize: number;

    @ApiProperty({ example: 5 })
    unreadCount: number;
}

export class NotificationReadData {
    @ApiProperty({ example: 'uxuui-67uhdjd-uhdjikd-772829' })
    id: string;

    @ApiProperty({ example: true })
    isRead: boolean;
}

export class NotificationReadCountData {
    @ApiProperty({ example: 5 })
    markedCount: number;
}

export class GetNotificationsResponseDto extends ApiResponseDto<NotificationPaginationData> {
    @ApiProperty({ example: 'Notifications retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => NotificationPaginationData })
    declare data: NotificationPaginationData;
}

export class GetNotificationResponseDto extends ApiResponseDto<NotificationData> {
    @ApiProperty({ example: 'Notification retrieved successfully' })
    declare message: string;

    @ApiProperty({ type: () => NotificationData })
    declare data: NotificationData;
}

export class ContactMessageResponseDto extends ApiResponseDto<NotificationData> {
    @ApiProperty({ example: 201 })
    declare statusCode: number;

    @ApiProperty({ example: 'Contact message sent successfully' })
    declare message: string;

    @ApiProperty({ type: () => NotificationData })
    declare data: NotificationData;
}

export class MarkAsReadResponseDto extends ApiResponseDto<NotificationReadData> {
    @ApiProperty({ example: 'Notification marked as read' })
    declare message: string;

    @ApiProperty({ type: () => NotificationReadData })
    declare data: NotificationReadData;
}

export class MarkAllAsReadResponseDto extends ApiResponseDto<NotificationReadCountData> {
    @ApiProperty({ example: 'All notifications marked as read' })
    declare message: string;

    @ApiProperty({ type: () => NotificationReadCountData })
    declare data: NotificationReadCountData;
}