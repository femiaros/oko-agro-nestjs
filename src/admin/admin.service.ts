import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuyRequest, OrderState } from 'src/buy-requests/entities/buy-request.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { Product, ProductApprovalStatus } from 'src/products/entities/product.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { ILike, Not, Repository } from 'typeorm';
import { CreateAdminUserDto } from './dtos/create-admin-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';

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

    async createAdmin(dto: CreateAdminUserDto) {
        try {
            // Check existing user
            const existing = await this.usersRepository.findOne({
                where: { email: ILike(dto.email) },
            });

            if (existing) {
                throw new ConflictException('Email already in use.');
            }

            const newUser = this.usersRepository.create({
                ...dto,
                role: UserRole.ADMIN,
                userVerified: true,     // admin does NOT need OTP verification
            });

            const saved = await this.usersRepository.save(newUser);

            return {
                statusCode: 201,
                message: 'Admin user created successfully',
                data: { id: saved.id },
            };
        } catch (error) {
            handleServiceError(error, "Error creating admin user");
        }
    }

    async updateUserStatus(dto: UpdateUserStatusDto) {
        try {
            const user = await this.usersRepository.findOne({ where: { id: dto.userId } });

            if (!user) throw new NotFoundException('User not found');

            user.isDisabled = dto.isDisabled;
            await this.usersRepository.save(user);

            return {
                statusCode: 200,
                message: `User has been ${dto.isDisabled ? 'disabled' : 'enabled'} successfully`,
            };
        } catch (error) {
            handleServiceError(error, 'Failed updating user status');
        }
    }

    async deleteAdmin(userId: string) {
        try {
            const user = await this.usersRepository.findOne({ where: { id: userId } });

            if (!user) throw new NotFoundException('User not found');
            
            if (user.role !== UserRole.ADMIN) {
                throw new BadRequestException('Only admin users can be deleted using this endpoint');
            }

            await this.usersRepository.remove(user);

            return {
                statusCode: 200,
                message: 'Admin user deleted successfully',
            };
        } catch (error) {
            handleServiceError(error, 'Failed deleting admin user');
        }
    }
}
