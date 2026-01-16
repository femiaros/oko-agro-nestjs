import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationAudience, NotificationType, RelatedEntityType } from './entities/notification.entity';
import { CreateNotificationPayload } from './interfaces/create-notification-payload';
import { User } from 'src/users/entities/user.entity';
import { GetNotificationsQueryDto } from './dtos/get-notifications-query.dto';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { ContactBuyerDto } from './dtos/contact-buyer.dto';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    
    constructor(
        @InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>,
        @InjectRepository(BuyRequest) private readonly buyRequestsRepository: Repository<BuyRequest>
    ) {}

    async createNotification( payload: CreateNotificationPayload): Promise<Notification> {
        const audience = payload.audience ?? NotificationAudience.USER;

        if (audience === NotificationAudience.USER && !payload.user) {
            throw new BadRequestException('User is required for USER notifications');
        }

        if (
            (audience === NotificationAudience.ADMINS || audience === NotificationAudience.SYSTEM) 
            && payload.user
        ) {
            throw new BadRequestException('User must be null for ADMIN or SYSTEM notifications');
        }

        const notification = this.notificationsRepository.create(
            {
            user: payload.user ?? null,
            audience,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            relatedEntityType: payload.relatedEntityType,
            relatedEntityId: payload.relatedEntityId,
            senderId: payload.senderId ?? null,
            senderName: payload.senderName ?? null,
            isRead: false,
            isDeleted: false,
            } as Partial<Notification>,
        );

        return this.notificationsRepository.save(notification);
    }

    async getNotifications( user: User, query: GetNotificationsQueryDto ) {
        try {
            const { pageNumber, pageSize, type, isRead } = query;

            const skip = (pageNumber - 1) * pageSize;

            const where: any = {
                user: { id: user.id },
                isDeleted: false,
            };

            if (type) {
                where.type = type;
            }

            if (isRead !== undefined) {
                where.isRead = isRead;
            }

            const [items, totalRecord] =
                await this.notificationsRepository.findAndCount({
                    where,
                    order: { createdAt: 'DESC' },
                    skip,
                    take: pageSize,
                    select: [
                        'id',
                        'type',
                        'title',
                        'message',
                        // 'relatedEntityType',
                        // 'relatedEntityId',
                        'senderId',
                        'senderName',
                        'isRead',
                        'createdAt',
                        'updatedAt',
                    ],
                });

            const unreadCount = await this.notificationsRepository.count({
                where: {
                    user: { id: user.id },
                    isRead: false,
                    isDeleted: false,
                },
            });

            return {
                statusCode: 200,
                message: 'Notifications retrieved successfully',
                data: {
                    items,
                    totalRecord,
                    pageNumber,
                    pageSize,
                    unreadCount,
                },
            };
        } catch (error) {
            this.logger.error( `Failed to retrieve notifications for user ${user.id}`, error.stack,);
            handleServiceError(error, 'An error occurred while retrieving user notifications');
        }
    }

    async getNotificationById( notificationId: string, user: User): Promise<any> {
        try {
            const notification = await this.notificationsRepository.findOne({
                where: {
                    id: notificationId,
                    user: { id: user.id },
                    isDeleted: false,
                },
                select: [
                    'id',
                    'type',
                    'title',
                    'message',
                    'senderId',
                    'senderName',
                    'isRead',
                    'createdAt',
                    'updatedAt',
                ],
            });

            if (!notification) {
                throw new NotFoundException('Notification not found');
            }

            return {
                statusCode: 200,
                message: 'Notification retrieved successfully',
                data: notification,
            };
        } catch (error) {
            this.logger.error( `Failed to fetch notification ${notificationId} for user ${user.id}`, error.stack);
            handleServiceError(error, 'An error occurred while retrieving user notification');
        }
    }

    async markAsRead(notificationId: string, user: User): Promise<any> {
        try {
            const notification = await this.notificationsRepository.findOne({
                where: {
                    id: notificationId,
                    user: { id: user.id },
                    isDeleted: false,
                },
            });

            if (!notification) {
                throw new NotFoundException( 'Notification not found or does not belong to user' );
            }

            // If already read
            if (notification.isRead) {
                return {
                    statusCode: 200,
                    message: 'Notification already marked as read',
                    data: {
                        id: notification.id,
                        isRead: true,
                    },
                };
            }

            notification.isRead = true;
            await this.notificationsRepository.save(notification);

            return {
                statusCode: 200,
                message: 'Notification marked as read',
                data: {
                    id: notification.id,
                    isRead: true,
                },
            };
        } catch (error) {
            this.logger.error(`Failed to mark notification ${notificationId} as read`, error.stack,);
            handleServiceError(error, 'An error occurred, failed to mark notification as read');
        }
    }

    async markAllAsRead(user: User): Promise<any> {
        try {
            const result = await this.notificationsRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ isRead: true })
                .where('userId = :userId', { userId: user.id })
                .andWhere('isRead = false')
                .andWhere('isDeleted = false')
                .execute();

            return {
                statusCode: 200,
                message: 'All notifications marked as read',
                data: {
                    markedCount: result.affected ?? 0,
                },
            };
        } catch (error) {
            this.logger.error(`Failed to mark all notifications as read for user ${user.id}`, error.stack,);
            handleServiceError(error, 'An error occurred, failed to mark all notifications as read');
        }
    }

    async contactBuyer( dto: ContactBuyerDto, farmer: User): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['buyer', 'seller', 'product', 'cropType'],
            });

            if (!buyRequest) {
                throw new NotFoundException('Buy request not found');
            }

             if (buyRequest.seller) {
                throw new BadRequestException(
                    'This buy request has already been directed to a seller and can no longer be contacted.',
                );
            }

            // Ensure processor matches request buyer
            if (buyRequest.buyer.id !== dto.processorId) {
                throw new ForbiddenException('This buy request does not belong to the specified processor' );
            }

            const processor = buyRequest.buyer;

            const farmerName = `${farmer.firstName.toLowerCase()} ${farmer.lastName.toLowerCase()}`;
            const cropName = buyRequest.cropType?.name || 'agricultural products';

            const message =
            dto.message ||
            `Hi, I'm ${farmerName} and I have ${cropName} available. ` +
            `You can view my profile and direct your request, send a purchase order, or contact me.\n` +
            `Farm is located in ${farmer.state}, ${farmer.country}.`;

            const notification = await this.createNotification({
                user: processor,
                type: NotificationType.Contact_Message,
                title: `New Contact Message from ${farmerName}`,
                message,
                senderId: farmer.id,
                senderName: farmerName,
                relatedEntityType: RelatedEntityType.BuyRequest,
                relatedEntityId: buyRequest.id,
            });

            return {
                statusCode: 201,
                message: 'Contact message sent successfully',
                data: {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    senderId: farmer.id,
                    senderName: farmerName,
                    recipientId: processor.id,
                    relatedEntityType: notification.relatedEntityType,
                    relatedEntityId: notification.relatedEntityId,
                    isRead: notification.isRead,
                    createdAt: notification.createdAt,
                },
            };
        } catch (error) {
            this.logger.error( `Failed to send contact message: ${error.message}` );
            handleServiceError(error, 'An error occurred while sending contact message');
        }
    }


}
