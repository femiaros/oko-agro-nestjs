import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { DisputeStatus } from 'src/disputes/entities/dispute.entity';

@Injectable()
export class BuyRequestsScheduler {
    private readonly logger = new Logger(BuyRequestsScheduler.name);

    constructor(
        @InjectRepository(BuyRequest)
        private readonly buyRequestsRepository: Repository<BuyRequest>,
    ) {}

    // Run every 5 minutes
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleAutoCompleteOrders() {
        if (process.env.RUN_SCHEDULER !== 'true') {
            this.logger.debug('Scheduler disabled (RUN_SCHEDULER not set to true)');
            return;
        }

        try {
            const now = new Date();
            const cutoff = new Date(now.getTime() - 1 * 60 * 1000);

            this.logger.debug(`Running auto-complete job at ${now.toISOString()}`);

            const result = await this.buyRequestsRepository
                .createQueryBuilder()
                .update(BuyRequest)
                .set({
                    orderState: OrderState.COMPLETED,
                    completedAt: () => 'CURRENT_TIMESTAMP',
                    orderStateTime: () => 'CURRENT_TIMESTAMP',
                })
                .where('orderState = :delivered', {
                    delivered: OrderState.DELIVERED,
                })
                .andWhere('orderStateTime < :cutoff', { cutoff })
                .andWhere('isDeleted = FALSE')
                // 🔒 Skip auto-completion if any open / under-review dispute exists
                .andWhere(
                    `NOT EXISTS (
                        SELECT 1
                        FROM disputes d
                        WHERE d."buyRequestId" = buy_requests.id
                        AND d.status IN (:...activeDisputeStatuses)
                    )`,
                    {
                        activeDisputeStatuses: [
                            DisputeStatus.OPEN,
                            DisputeStatus.UNDER_REVIEW,
                        ],
                    },
                )
                .execute();

            if (result.affected && result.affected > 0) {
                this.logger.log(`✅ Auto-completed ${result.affected} orders`);
            } else {
                this.logger.debug('No eligible orders for auto-completion');
            }

        } catch (error) {
            this.logger.error('❌ Scheduler failed:', error);
        }
    }

}