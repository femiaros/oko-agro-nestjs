import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';

@Injectable()
export class BuyRequestsScheduler {
    private readonly logger = new Logger(BuyRequestsScheduler.name);

    constructor(
        @InjectRepository(BuyRequest)
        private readonly buyRequestsRepository: Repository<BuyRequest>,
    ) {}

    // Run every 5 minutes instead of 30 sec (safe)
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

            // Batch update ONLY — does NOT load full entities
            const result = await this.buyRequestsRepository
                .createQueryBuilder()
                .update(BuyRequest)
                .set({
                    orderState: OrderState.COMPLETED,
                    orderStateTime: () => 'CURRENT_TIMESTAMP',
                })
                .where('orderState = :delivered', { delivered: OrderState.DELIVERED })
                .andWhere('orderStateTime < :cutoff', { cutoff })
                .andWhere('isDeleted = FALSE')
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