import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Rating, RatingRole } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { User } from 'src/users/entities/user.entity';
import { DisputeStatus } from 'src/disputes/entities/dispute.entity';
import { NotificationType, RelatedEntityType } from 'src/notifications/entities/notification.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';

@Injectable()
export class RatingsService {
    private readonly logger = new Logger(RatingsService.name);
        
    constructor(
        @InjectRepository(Rating) private readonly ratingsRepository: Repository<Rating>,
        @InjectRepository(BuyRequest) private readonly buyRequestsRepository: Repository<BuyRequest>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly notificationsService: NotificationsService,
    ) {}

    async createRating( dto: CreateRatingDto, currentUser: User ): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['buyer', 'seller', 'disputes'],
            });

            if (!buyRequest) {
                throw new NotFoundException('BuyRequest not found');
            }

            // 🔹 Ensure user is part of the BuyRequest
            const isBuyer = buyRequest.buyer?.id === currentUser.id;
            const isSeller = buyRequest.seller?.id === currentUser.id;

            if (!isBuyer && !isSeller) {
                throw new ForbiddenException('You are not authorized to rate this transaction');
            }

            // 🔹 Validate order state OR dispute closure
            const hasClosedDispute = buyRequest.disputes?.some(
                (d) => d.status === DisputeStatus.RESOLVED || d.status === DisputeStatus.REJECTED,
            );

            if (buyRequest.orderState !== OrderState.COMPLETED && !hasClosedDispute) {
                throw new BadRequestException('Ratings can only be created after completion or resolved/rejected dispute' );
            }

            // 🔹 Ensure user has not rated this BuyRequest already
            const existingRating = await this.ratingsRepository.findOne({
                where: {
                    buyRequest: { id: buyRequest.id },
                    rater: { id: currentUser.id },
                    isDeleted: false,
                },
            });

            if (existingRating) {
                throw new BadRequestException(  'You have already rated this transaction' );
            }

            // 🔹 Determine ratee
            const ratee = isBuyer ? buyRequest.seller : buyRequest.buyer;

            if (!ratee) {
                throw new BadRequestException('Unable to determine the user to be rated');
            }

            // 🔹 Create rating
            const rating = this.ratingsRepository.create({
                buyRequest,
                rater: currentUser,
                ratee,
                raterRole: isBuyer ? RatingRole.BUYER : RatingRole.SELLER,
                rateeRole: isBuyer ? RatingRole.SELLER : RatingRole.BUYER,
                score: dto.score,
                comment: dto.comment ?? null,
            });

            const savedRating = await this.ratingsRepository.save(rating);

            // 🔹 Notify the other party
            await this.notificationsService.createNotification({
                user: ratee,
                type: NotificationType.Rating,
                title: 'New Rating Received',
                message: `${currentUser.firstName.toUpperCase()} ${currentUser.lastName.toUpperCase()} left you a ${dto.score}⭐ rating for your recent transaction.`,
                relatedEntityType: RelatedEntityType.BuyRequest,
                relatedEntityId: buyRequest.id
            });

            return {
                statusCode: 201,
                message: 'Rating created successfully',
                data: {
                    id: savedRating.id,
                    score: savedRating.score,
                    comment: savedRating.comment,
                    createdAt: savedRating.createdAt,
                },
            };
        } catch (error) {
            this.logger.error( 'Error while creating rating', error.stack );
            handleServiceError( error, 'An error occurred while creating rating' );
        }
    }

    
    async getUserRatingsStats(userId: string): Promise<any> {
        try {
            // Optional: verify user exists
            const userExists = await this.usersRepository.exist({
                where: { id: userId },
            });

            if (!userExists) {
                throw new NotFoundException('User not found');
            }

            /**
             * Aggregate ratings
             */
            const rawStats = await this.ratingsRepository
                .createQueryBuilder('rating')
                .select('COUNT(rating.id)', 'total')
                .addSelect('AVG(rating.score)', 'average')
                .addSelect(
                    `SUM(CASE WHEN rating.score = 5 THEN 1 ELSE 0 END)`,
                    'five',
                )
                .addSelect(
                    `SUM(CASE WHEN rating.score = 4 THEN 1 ELSE 0 END)`,
                    'four',
                )
                .addSelect(
                    `SUM(CASE WHEN rating.score = 3 THEN 1 ELSE 0 END)`,
                    'three',
                )
                .addSelect(
                    `SUM(CASE WHEN rating.score = 2 THEN 1 ELSE 0 END)`,
                    'two',
                )
                .addSelect(
                    `SUM(CASE WHEN rating.score = 1 THEN 1 ELSE 0 END)`,
                    'one',
                )
                .where('rating.ratee.id = :userId', { userId })
                .getRawOne();

            const total = Number(rawStats.total) || 0;
            const average = total > 0 ? Number(rawStats.average) : 0;

            return {
                statusCode: 200,
                message: 'User rating statistics retrieved successfully',
                data: {
                    average: Number(average.toFixed(1)),
                    total,
                    breakdown: {
                        '5': Number(rawStats.five) || 0,
                        '4': Number(rawStats.four) || 0,
                        '3': Number(rawStats.three) || 0,
                        '2': Number(rawStats.two) || 0,
                        '1': Number(rawStats.one) || 0,
                    },
                },
            };
        } catch (error) {
            this.logger.error( `Error retrieving ratings for user ${userId}`, error.stack);
            handleServiceError(error, 'An error occurred while retrieving user ratings');
        }
    }

}
