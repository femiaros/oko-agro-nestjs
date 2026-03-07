import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { DisputeStatus } from 'src/disputes/entities/dispute.entity';
import { ProductInventoriesService } from 'src/product-inventories/product-inventories.service';
import Decimal from 'decimal.js';

@Injectable()
export class BuyRequestsScheduler {
    private readonly logger = new Logger(BuyRequestsScheduler.name);

    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(BuyRequest)
        private readonly buyRequestsRepository: Repository<BuyRequest>,

        private readonly productInventoriesService: ProductInventoriesService,
    ) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleAutoCompleteOrders() {
        if (process.env.RUN_SCHEDULER !== 'true') {
            this.logger.debug('Scheduler disabled (RUN_SCHEDULER not set to true)');
            return;
        }

        const now = new Date();
        const cutoff = new Date(now.getTime() - 1 * 60 * 1000);

        this.logger.debug(`Running auto-complete job at ${now.toISOString()}`);

        try {
            // ✅ Load eligible orders WITH product relation
            const eligibleOrders = await this.buyRequestsRepository
                .createQueryBuilder('buyRequest')
                .leftJoinAndSelect('buyRequest.product', 'product')
                .leftJoinAndSelect('buyRequest.buyer', 'buyer')
                .leftJoinAndSelect('buyRequest.seller', 'seller')
                .where('buyRequest.orderState = :delivered', {
                    delivered: OrderState.DELIVERED,
                })
                .andWhere('buyRequest.orderStateTime < :cutoff', { cutoff })
                .andWhere('buyRequest.isDeleted = FALSE')
                .andWhere(
                    `NOT EXISTS (
                        SELECT 1
                        FROM disputes d
                        WHERE d."buyRequestId" = "buyRequest"."id"
                        AND d.status IN (:...activeDisputeStatuses)
                    )`,
                    {
                        activeDisputeStatuses: [
                            DisputeStatus.OPEN,
                            DisputeStatus.UNDER_REVIEW,
                        ],
                    },
                )
                .getMany();

            if (!eligibleOrders.length) {
                this.logger.debug('No eligible orders for auto-completion');
                return;
            }

            for (const order of eligibleOrders) {
                await this.dataSource.transaction(async (manager) => {
                    // 1️⃣ Deduct stock + create inventory log
                    await this.productInventoriesService.deductStock(
                        order.product!.id,
                        order.productQuantityKg,
                        order.id,
                        manager,
                    );

                    // 2️⃣ Calculate amount using Decimal
                    const amount = new Decimal(order.paymentAmount ?? '0');

                    // 3️⃣ Update seller lifetime sales
                    if (order.seller) {
                        const sellerTotal = new Decimal(
                            order.seller.totalFarmerSalesAmount ?? '0',
                        );

                        order.seller.totalFarmerSalesAmount = sellerTotal
                            .plus(amount)
                            .toDecimalPlaces(2)
                            .toFixed(2);
                        
                        order.seller.buyRequestCompleted = (order.seller.buyRequestCompleted + 1); 

                        await manager.save(order.seller);
                    }

                    // 4️⃣ Update buyer lifetime purchases
                    if (order.buyer) {
                        const buyerTotal = new Decimal(
                            order.buyer.totalProcessorPurchasesAmount ?? '0',
                        );

                        order.buyer.totalProcessorPurchasesAmount = buyerTotal
                            .plus(amount)
                            .toDecimalPlaces(2)
                            .toFixed(2);

                        order.buyer.buyRequestCompleted = (order.buyer.buyRequestCompleted + 1);
                        
                        await manager.save(order.buyer);
                    }

                    // 5️⃣ Mark order completed
                    order.orderState = OrderState.COMPLETED;
                    order.completedAt = new Date();
                    order.orderStateTime = new Date();

                    await manager.save(order);
                });

                this.logger.log(`✅ Auto-completed order ${order.id}`);
            }

        } catch (error) {
            this.logger.error('❌ Scheduler failed:', error);
        }
    }
}