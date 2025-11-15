import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { Product, ProductApprovalStatus } from 'src/products/entities/product.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(BuyRequest)
        private readonly buyRequestsRepository: Repository<BuyRequest>,

        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async getDashboardOverview() {
        try {
            // 1️⃣ Total Users (exclude admins)
            const totalUsers = await this.usersRepository.count({
                where: { role: Not(UserRole.ADMIN), isDeleted: false },
            });

            // 2️⃣ Total Transactions Value
            // (sum of paymentAmount where orderState = 'in_transit')
            const transactions = await this.buyRequestsRepository
                .createQueryBuilder('buyRequest')
                .select('SUM(CAST(buyRequest.paymentAmount AS DECIMAL))', 'total')
                .where('buyRequest.orderState = :state', { state: OrderState.IN_TRANSIT })
                .getRawOne();

            const totalTransactionValue = transactions?.total
                ? Number(transactions.total)
                : 0;

            // 3️⃣ Completed Orders
            const completedOrders = await this.buyRequestsRepository.count({
                where: { orderState: OrderState.COMPLETED, isDeleted: false },
            });

            // 4️⃣ Pending Listings
            const pendingListings = await this.productsRepository.count({
                where: { approvalStatus: ProductApprovalStatus.PENDING, isDeleted: false },
            });

            return {
                statusCode: 200,
                message: 'Dashboard stats fetched successfully',
                data: {
                    totalUsers,
                    totalTransactionValue,
                    completedOrders,
                    pendingListings,
                },
            };
        } catch (error) {
            handleServiceError(error, 'Failed to fetch dashboard stats');
        }
    }
}
