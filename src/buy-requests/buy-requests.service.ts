import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { BuyRequest, BuyRequestStatus } from './entities/buy-request.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { QualityStandard } from 'src/quality-standards/entities/quality-standard.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateBuyRequestDto } from './dtos/create-buy-request.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { UsersService } from 'src/users/users.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateBuyRequestStatusDto } from './dtos/update-buy-request-status.dto';
import { UpdateBuyRequestDto } from './dtos/update-buy-request.dto';

@Injectable()
export class BuyRequestsService {
    constructor(
        @InjectRepository(BuyRequest) private readonly buyRequestsRepository: Repository<BuyRequest>,
        @InjectRepository(Crop) private readonly cropsRepository: Repository<Crop>,
        @InjectRepository(QualityStandard) private readonly qualityStandardRepository: Repository<QualityStandard>,
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        private readonly usersService: UsersService
    ) {}

    
    async create(dto: CreateBuyRequestDto, buyer: User): Promise<any> {
        const { cropId, qualityStandardId, productId, sellerId, ...rest } = dto;
        try{
            if (dto.isGeneral){
                if(dto.sellerId) throw new BadRequestException(`General buy request doesn't require a sellerId to be provided at initiation`);
                if(dto.productId) throw new BadRequestException(`General buy request doesn't require a productId to be provided at initiation`);
            }

            const crop = await this.cropsRepository.findOne({ where: { id: dto.cropId } });
            if (!crop) throw new BadRequestException('Invalid cropId');

            let qualityStandard: QualityStandard | null = null;
            if (dto.qualityStandardId) {
                qualityStandard = await this.qualityStandardRepository.findOne({
                    where: { id: dto.qualityStandardId, },
            });

            if (dto.qualityStandardId && !qualityStandard)
                throw new BadRequestException('Invalid qualityStandardId');
            }

            let product: Product | null = null;

            if (dto.productId) {
                product = await this.productsRepository.findOne({
                    where: { id: dto.productId, isDeleted: false },
                    relations: ['owner', 'cropType']
                });
                if (!product) throw new BadRequestException('Invalid productId');
            }

            if (dto.productId && product && product.cropType.id !== dto.cropId){
                throw new BadRequestException(`Seller's product crop type: ${product.cropType.name} should match the crop type required on BuyRequest`);
            }

            const requestNumber = await this.generateRequestNumber();

            const seller = dto.sellerId ? await this.usersService.findUserEntity(dto.sellerId) : null;

            if (seller && seller.role !== UserRole.FARMER) {
                throw new BadRequestException('Seller must be a farmer');
            }

            const buyRequest = this.buyRequestsRepository.create({
                ...rest,
                cropType: crop,
                qualityStandardType: qualityStandard,
                buyer,
                seller,
                product,
                requestNumber,
                status: BuyRequestStatus.PENDING,
            });

            const savedBuyRequest = await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 201,
                message: 'BuyRequest created successfully!',
                data: instanceToPlain(savedBuyRequest)
            };
        }catch(error){
            handleServiceError(error, 'An error occurred, while creating BuyRequest');
        }
    }

    async updateBuyRequest(dto: UpdateBuyRequestDto, currentUser: User,): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['buyer', 'qualityStandardType'],
            });

            if (!buyRequest) {
                throw new NotFoundException('Buy request not found');
            }

            // Ensure only the buyer who created it can update
            if (buyRequest.buyer.id !== currentUser.id) {
                throw new ForbiddenException('You are not authorized to update this buy request');
            }

            // Block editing if already accepted
            if (buyRequest.status === BuyRequestStatus.ACCEPTED) {
                throw new BadRequestException('Accepted buy requests cannot be updated');
            }

            // Handle qualityStandard change
            if (dto.qualityStandardId) {
                const qualityStandard = await this.qualityStandardRepository.findOne({
                    where: { id: dto.qualityStandardId },
                });

                if (!qualityStandard) {
                    throw new BadRequestException('Invalid qualityStandardId');
                }

                buyRequest.qualityStandardType = qualityStandard;
            }

            // Map other editable fields
            const editableFields: (keyof UpdateBuyRequestDto)[] = [
                'description',
                'productQuantity',
                'productQuantityUnit',
                'pricePerUnitOffer',
                'estimatedDeliveryDate',
                'deliveryLocation',
                'preferredPaymentMethod',
            ];

            for (const field of editableFields) {
                if (dto[field] !== undefined && dto[field] !== null) {
                    (buyRequest as any)[field] = dto[field];
                }
            }

            // Reset status to PENDING
            buyRequest.status = BuyRequestStatus.PENDING;

            const saved = await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 200,
                message: 'Buy request updated successfully!',
                data: instanceToPlain(saved),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while updating buy request');
        }
    }

    async updateStatus(dto: UpdateBuyRequestStatusDto, currentUser: User,): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['buyer', 'seller', 'product'],
            });

            if (!buyRequest) throw new NotFoundException('BuyRequest not found');

            // Only farmer (seller) can update status
            // if (currentUser.role !== 'farmer')
            // throw new BadRequestException('Only farmers can update requests');

            // Case: General request
            if (buyRequest.isGeneral) {
                if (dto.status !== BuyRequestStatus.ACCEPTED) {
                    throw new BadRequestException('Farmer can only accept general buyRequests');
                }

                if (!dto.productId) {
                    throw new BadRequestException('Provide a productId to accept a general buyRequest');
                }

                const product = await this.productsRepository.findOne({
                    where: { id: dto.productId, owner: { id: currentUser.id }, isDeleted: false },
                });

                if (!product) {
                    throw new BadRequestException('Invalid productId or product does not belong to this farmer', );
                }

                buyRequest.status = BuyRequestStatus.ACCEPTED;
                buyRequest.seller = currentUser;
                buyRequest.product = product;
            }
            // Case: Directed buyrequest
            else {
                if (!buyRequest.seller || buyRequest.seller.id !== currentUser.id) {
                    throw new ForbiddenException('This farmer is not authorized to update this request');
                }

                if (
                    ![ BuyRequestStatus.ACCEPTED, BuyRequestStatus.REJECTED, BuyRequestStatus.CANCELLED,].includes(dto.status)
                ) {
                    throw new BadRequestException('Invalid status update for directed buy request',);
                }

                buyRequest.status = dto.status;

                // If accepted, optionally update product
                if (dto.status === BuyRequestStatus.ACCEPTED && dto.productId) {
                    const product = await this.productsRepository.findOne({
                        where: { id: dto.productId, owner: { id: currentUser.id }, isDeleted: false },
                    });

                    if (!product) {
                        throw new BadRequestException('Invalid productId or product does not belong to this farmer',);
                    }

                    buyRequest.product = product;
                }
            }

            const savedBuyRequest = await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 200,
                message: `BuyRequest ${dto.status} successfully`,
                data: instanceToPlain(savedBuyRequest)
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred, while updating BuyRequest status');
        }
    }

    async findGeneralRequests(): Promise<any> {
        try {
            const now = new Date();
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);

            const buyRequests = await this.buyRequestsRepository.find({
                where: {
                    isGeneral: true,
                    isDeleted: false,
                    status: BuyRequestStatus.PENDING,
                    createdAt: MoreThan(oneWeekAgo),
                },
                order: { createdAt: 'DESC' },
            });

            return {
                statusCode: 200,
                message: 'General buy requests fetched successfully',
                data: buyRequests,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred, while fetching general BuyRequest');
        }
    }

    async findUserBuyRequests(
        currentUser: User,
        status?: BuyRequestStatus,
        pageNumber: number = 1,
        pageSize: number = 20,
    ): Promise<any> {
        try {
            const skip = (pageNumber - 1) * pageSize;

            // Determine allowed statuses based on role
            let allowedStatuses: BuyRequestStatus[] = [];

            if (currentUser.role === UserRole.FARMER) {
                // Farmers can only see requests where they are the seller
                // and only if status is ACCEPTED or REJECTED
                allowedStatuses = [BuyRequestStatus.ACCEPTED, BuyRequestStatus.REJECTED];
            } else if (currentUser.role === UserRole.PROCESSOR) {
                // Processors (buyers) can see all
                allowedStatuses = [
                    BuyRequestStatus.PENDING,
                    BuyRequestStatus.ACCEPTED,
                    BuyRequestStatus.REJECTED,
                    BuyRequestStatus.CANCELLED,
                ];
            } else {
                throw new ForbiddenException('Only farmers and processors can view buy requests');
            }

            // Narrow down status filter if provided
            if (status && !allowedStatuses.includes(status)) {
                throw new ForbiddenException(`You are not allowed to view requests with status ${status}`);
            }

            const where: any = {
                isDeleted: false,
                ...(status ? { status } : { status: In(allowedStatuses) }),
            };

            // Add role-based ownership condition
            if (currentUser.role === UserRole.FARMER) {
                where.seller = { id: currentUser.id };
            } else if (currentUser.role === UserRole.PROCESSOR) {
                where.buyer = { id: currentUser.id };
            }

            const [items, totalRecord] = await this.buyRequestsRepository.findAndCount({
                where,
                relations: ['cropType', 'qualityStandardType', 'buyer', 'seller', 'product'],
                order: { createdAt: 'DESC' },
                skip,
                take: pageSize,
            });

            return {
                statusCode: 200,
                message: 'Buy requests fetched successfully',
                data: {
                    items: instanceToPlain(items),
                    totalRecord,
                    pageNumber,
                    pageSize,
                },
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while fetching buy requests');
        }
    }

    async deleteRequest(id: string, currentUser: User): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({ where: { id } });
            if (!buyRequest || buyRequest.isDeleted) throw new NotFoundException('BuyRequest not found');

            if (currentUser.id !== buyRequest.buyer.id)
            throw new ForbiddenException('Not authorized to delete this request');

            buyRequest.isDeleted = true;
            await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 200,
                message: 'BuyRequest deleted successfully',
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred, while deleting BuyRequest');
        }
    }

    // Generate sequential requestNumber
    private async generateRequestNumber(): Promise<number> {
        const last = await this.buyRequestsRepository.find({
            order: { requestNumber: 'DESC' },
            take: 1,
        });

        if (last.length === 0) return 100001;
        return Number(last[0].requestNumber) + 1;
    }
}
