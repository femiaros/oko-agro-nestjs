import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispute, DisputeInitiator, DisputeStatus } from './entities/dispute.entity';
import { In, Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateDisputeDto } from './dtos/create-dispute.dto';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationAudience, NotificationType, RelatedEntityType } from 'src/notifications/entities/notification.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { GetAllDisputesQueryDto } from './dtos/get-all-disputes-query.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class DisputesService {
    private readonly logger = new Logger(DisputesService.name);
    
    constructor(
        @InjectRepository(Dispute) private readonly disputesRepository: Repository<Dispute>,
        @InjectRepository(BuyRequest) private readonly buyRequestsRepository: Repository<BuyRequest>,
        private readonly notificationsService: NotificationsService,
    ) {}

    async createDispute( dto: CreateDisputeDto, currentUser: User ): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['buyer', 'seller'],
            });

            if (!buyRequest) { throw new NotFoundException('Buy request not found'); }

            const isBuyer = buyRequest.buyer?.id === currentUser.id;
            const isSeller = buyRequest.seller?.id === currentUser.id;

            if (!isBuyer && !isSeller) {
                throw new ForbiddenException(
                    'You are not allowed to raise a dispute for this buy request',
                );
            }

            const existingDispute = await this.disputesRepository.findOne({
                where: {
                    buyRequest: { id: buyRequest.id },
                    status: In([
                        DisputeStatus.OPEN,
                        DisputeStatus.UNDER_REVIEW,
                    ]),
                    isDeleted: false,
                },
            });

            if (existingDispute) {
                throw new BadRequestException(
                    'An active dispute already exists for this buy request',
                );
            }

            if (buyRequest.orderState === OrderState.COMPLETED) {
                const DISPUTE_GRACE_PERIOD_HOURS = 24;
                
                if (!buyRequest.completedAt) {
                    throw new BadRequestException(
                        'Completed buy request is missing completion timestamp',
                    );
                }

                const completedAt = new Date(buyRequest.completedAt);
                const now = new Date();

                const diffInMs = now.getTime() - completedAt.getTime();
                const diffInHours = diffInMs / (1000 * 60 * 60);

                if (diffInHours > DISPUTE_GRACE_PERIOD_HOURS) {
                    throw new BadRequestException(
                        'Dispute window has expired for this buy request',
                    );
                }
            }

            const dispute = this.disputesRepository.create({
                buyRequest,
                initiatedBy: currentUser,
                initiatorType: isBuyer ? DisputeInitiator.BUYER : DisputeInitiator.SELLER,
                reason: dto.reason,
                status: DisputeStatus.OPEN,
            });

            const savedDispute = await this.disputesRepository.save(dispute);

            // *** 🔔 Notifications ***

            // Notify Buyer
            await this.notificationsService.createNotification({
                user: buyRequest.buyer,
                type: NotificationType.Dispute,
                title: 'Dispute Raised',
                message: `A dispute has been raised for Buy Request #${buyRequest.id}.`,
                relatedEntityType: RelatedEntityType.Dispute,
                relatedEntityId: savedDispute.id
            });

            // Notify Seller
            if (buyRequest.seller) {
                await this.notificationsService.createNotification({
                    user: buyRequest.seller,
                    type: NotificationType.Dispute,
                    title: 'Dispute Raised',
                    message: `A dispute has been raised for Buy Request #${buyRequest.id}.`,
                    relatedEntityType: RelatedEntityType.Dispute,
                    relatedEntityId: savedDispute.id
                });
            }

            // Notify Admin audience
            await this.notificationsService.createNotification({
                audience: NotificationAudience.ADMINS,
                type: NotificationType.Dispute,
                title: 'New Dispute Raised',
                message: `A new dispute has been raised for Buy Request #${buyRequest.id}.`,
                relatedEntityType: RelatedEntityType.Dispute,
                relatedEntityId: savedDispute.id,
            });

            return {
                statusCode: 201,
                message: 'Dispute raised successfully',
                data: savedDispute,
            };
        } catch (error) {
            this.logger.error( 'Error while creating dispute', error.stack,);
            handleServiceError(error, 'Failed to raise dispute');
        }
    }

    async getAllDisputes( query: GetAllDisputesQueryDto, ): Promise<any> {
        try {
            const pageNumber = query.pageNumber ? Number(query.pageNumber) : 1;
            const pageSize = query.pageSize ? Number(query.pageSize) : 20;
            const skip = (pageNumber - 1) * pageSize;

            const qb = this.disputesRepository
                .createQueryBuilder('dispute')
                .leftJoinAndSelect('dispute.buyRequest', 'buyRequest')
                .leftJoinAndSelect('dispute.initiatedBy', 'initiatedBy')
                .leftJoinAndSelect('buyRequest.buyer', 'buyer')
                .leftJoinAndSelect('buyRequest.seller', 'seller')
                .where('dispute.isDeleted = FALSE') 
                .orderBy('dispute.createdAt', 'DESC');

            // 🔹 Filter by status (optional)
            if (query.status) {
                qb.andWhere('dispute.status = :status', {
                    status: query.status,
                });
            }

            // 🔹 Search (optional)
            if (query.search) {
                qb.andWhere(
                    `
                    dispute.id ILIKE :search
                    OR dispute.reason ILIKE :search
                    OR initiatedBy.fullName ILIKE :search
                    `,
                    {
                        search: `%${query.search}%`,
                    },
                );
            }

            const [disputes, total] = await qb
                .skip(skip)
                .take(pageSize)
                .getManyAndCount();

            return {
                statusCode: 200,
                message: 'Disputes retrieved successfully',
                data: {
                    items: instanceToPlain(disputes),
                    total,
                    pageNumber,
                    pageSize
                }
            };
        } catch (error) {
            this.logger.error( 'Error while retrieving disputes', error.stack,);
            handleServiceError(  error, 'An error occurred while retrieving disputes',);
        }
    }

    async getDisputeById(disputeId: string, currentUser: User,): Promise<any> {
        try {
            const dispute = await this.disputesRepository.findOne({
                where: {
                    id: disputeId,
                    isDeleted: false,
                },
                relations: [
                    'buyRequest',
                    'initiatedBy',
                    'buyRequest.buyer',
                    'buyRequest.seller',
                ],
            });

            if (!dispute) {
                throw new NotFoundException('Dispute not found');
            }

            const buyRequest = dispute.buyRequest;

            const isAdmin =
                currentUser.role === UserRole.ADMIN ||
                currentUser.role === UserRole.SUPER_ADMIN;

            const isBuyer =
                buyRequest.buyer &&
                buyRequest.buyer.id === currentUser.id;

            const isSeller =
                buyRequest.seller &&
                buyRequest.seller.id === currentUser.id;

            if (!isAdmin && !isBuyer && !isSeller) {
                throw new ForbiddenException('You do not have access to this dispute');
            }

            return {
                statusCode: 200,
                message: 'Dispute retrieved successfully',
                data: instanceToPlain(dispute),
            };
        } catch (error) {
            this.logger.error('Error while retrieving dispute', error.stack);
            handleServiceError(error,'An error occurred while retrieving dispute');
        }
    }

    async resolveDispute(disputeId: string, currentUser: User): Promise<any> {
        try {
            const dispute = await this.disputesRepository.findOne({
                where: {
                    id: disputeId,
                    isDeleted: false,
                },
                relations: [
                    'buyRequest',
                    'initiatedBy',
                    'buyRequest.buyer',
                    'buyRequest.seller',
                ],
            });

            if (!dispute) {
                throw new NotFoundException('Dispute not found');
            }

            // Only OPEN or UNDER_REVIEW disputes can be resolved
            if (
                dispute.status !== DisputeStatus.OPEN &&
                dispute.status !== DisputeStatus.UNDER_REVIEW
            ) {
                throw new BadRequestException( 'Only open or under-review disputes can be resolved', );
            }

            dispute.status = DisputeStatus.RESOLVED;
            dispute.resolvedBy = currentUser.id;
            dispute.resolvedAt = new Date();

            await this.disputesRepository.save(dispute);

            const buyRequest = dispute.buyRequest;
            const buyer = buyRequest.buyer;
            const seller = buyRequest.seller;

            const requestRef = buyRequest.requestNumber ?? buyRequest.id;

            // *** 🔔 Notifications ***

            // Message for the initiator
            const initiatorMessage = `Your dispute for Buy Request #${requestRef} has been resolved.`;

            // Message for the other party
            const otherPartyMessage = `The dispute for Buy Request #${requestRef} has been resolved.`;

            if (dispute.initiatorType === DisputeInitiator.BUYER) {
                // Buyer initiated → buyer gets "your dispute", seller gets generic
                await this.notificationsService.createNotification({
                    user: buyer,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Resolved',
                    message: initiatorMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });

                await this.notificationsService.createNotification({
                    user: seller,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Resolved',
                    message: otherPartyMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });
            } else {
                // Seller initiated → seller gets "your dispute", buyer gets generic
                await this.notificationsService.createNotification({
                    user: seller,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Resolved',
                    message: initiatorMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });

                await this.notificationsService.createNotification({
                    user: buyer,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Resolved',
                    message: otherPartyMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });
            }

            return {
                statusCode: 200,
                message: 'Dispute resolved successfully',
                data: {
                    id: dispute.id,
                    status: dispute.status,
                    resolvedAt: dispute.resolvedAt,
                },
            };
        } catch (error) {
            this.logger.error('Error while resolving dispute', error.stack);
            handleServiceError(error, 'An error occurred while resolving dispute');
        }
    }

    async rejectDispute(disputeId: string, currentUser: User): Promise<any> {
        try {
            const dispute = await this.disputesRepository.findOne({
                where: {
                    id: disputeId,
                    isDeleted: false,
                },
                relations: [
                    'buyRequest',
                    'initiatedBy',
                    'buyRequest.buyer',
                    'buyRequest.seller',
                ],
            });

            if (!dispute) {
                throw new NotFoundException('Dispute not found');
            }

            // Only OPEN or UNDER_REVIEW disputes can be rejected
            if (
                dispute.status !== DisputeStatus.OPEN &&
                dispute.status !== DisputeStatus.UNDER_REVIEW
            ) {
                throw new BadRequestException(
                    'Only open or under-review disputes can be rejected',
                );
            }

            dispute.status = DisputeStatus.REJECTED;
            dispute.rejectedAt = new Date();
            dispute.rejectedBy = currentUser.id;

            await this.disputesRepository.save(dispute);

            const buyRequest = dispute.buyRequest;
            const buyer = buyRequest.buyer;
            const seller = buyRequest.seller;

            const requestRef = buyRequest.requestNumber ?? buyRequest.id;

            // ***🔔 Notifications ***

            const initiatorMessage = `Your dispute for Buy Request #${requestRef} has been rejected.`;
            const otherPartyMessage = `The dispute for Buy Request #${requestRef} has been rejected.`;

            if (dispute.initiatorType === DisputeInitiator.BUYER) {
                // Buyer initiated dispute
                await this.notificationsService.createNotification({
                    user: buyer,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Rejected',
                    message: initiatorMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });

                await this.notificationsService.createNotification({
                    user: seller,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Rejected',
                    message: otherPartyMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });
            } else {
                // Seller initiated dispute
                await this.notificationsService.createNotification({
                    user: seller,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Rejected',
                    message: initiatorMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });

                await this.notificationsService.createNotification({
                    user: buyer,
                    type: NotificationType.OrderStatus,
                    title: 'Dispute Rejected',
                    message: otherPartyMessage,
                    relatedEntityType: RelatedEntityType.BuyRequest,
                    relatedEntityId: buyRequest.id,
                });
            }

            return {
                statusCode: 200,
                message: 'Dispute rejected successfully',
                data: {
                    id: dispute.id,
                    status: dispute.status,
                    rejectedAt: dispute.rejectedAt,
                },
            };
        } catch (error) {
            this.logger.error( 'Error while rejecting dispute', error.stack);
            handleServiceError( error, 'An error occurred while rejecting dispute' );
        }
    }

}
