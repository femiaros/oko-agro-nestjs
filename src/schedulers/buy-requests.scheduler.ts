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

    // Runs every 10 seconds - .EVERY_10_SECONDS
    // AutoComplete BuyRequest's orderState
    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleAutoCompleteOrders() {
        // Prevent running if scheduler disabled
        if (process.env.RUN_SCHEDULER !== 'true') {
            this.logger.debug('Scheduler disabled (RUN_SCHEDULER not set to true)');
            return;
        }

        const now = new Date();
        const cutoff = new Date(now.getTime() - 1 * 60 * 1000); // 1 min ago

        this.logger.debug(`Running auto-complete job at ${now.toISOString()}`);

        // Perform a single batch update (fast and efficient)
        const result = await this.buyRequestsRepository
            .createQueryBuilder()
            .update(BuyRequest)
            .set({
                orderState: OrderState.COMPLETED,
                orderStateTime: () => 'CURRENT_TIMESTAMP',
            })
            .where('orderState = :delivered', { delivered: OrderState.DELIVERED })
            .andWhere('orderStateTime < :cutoff', { cutoff })
            .andWhere('isDeleted = false')
            .execute();

        if (result.affected && result.affected > 0) {
            this.logger.log(`✅ Auto-completed ${result.affected} orders`);
        } else {
            this.logger.debug('No eligible orders for auto-completion');
        }
    }
}