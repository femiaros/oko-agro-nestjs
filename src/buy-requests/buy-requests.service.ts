import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { BuyRequest, BuyRequestStatus, OrderState } from './entities/buy-request.entity';
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
import { UpdateOrderStateDto } from './dtos/update-order-state.dto';
import { OngoingBuyRequestOrdersQueryDto } from './dtos/ongoing-buy-request-orders-query.dto';
import { detectMimeTypeFromBase64, isValidBase64Size, isValidBase64SizeGeneric, isValidImageType } from 'src/common/utils/base64.util';
import { PurchaseOrderDocFilesService } from 'src/purchase-order-doc-files/purchase-order-doc-files.service';
import { UpdatePurchaseOrderDocDto } from './dtos/update-purchase-order-doc.dto';

@Injectable()
export class BuyRequestsService {
    constructor(
        @InjectRepository(BuyRequest) private readonly buyRequestsRepository: Repository<BuyRequest>,
        @InjectRepository(Crop) private readonly cropsRepository: Repository<Crop>,
        @InjectRepository(QualityStandard) private readonly qualityStandardRepository: Repository<QualityStandard>,
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        private readonly usersService: UsersService,
        private readonly fileService: PurchaseOrderDocFilesService,
    ) {}

    
    async create(dto: CreateBuyRequestDto, buyer: User): Promise<any> {
        const { cropId, qualityStandardId, productId, sellerId, purchaseOrderDoc, ...rest } = dto;

        try{
            if (dto.isGeneral){
                if(dto.sellerId) throw new BadRequestException(`General buy request doesn't require a sellerId to be provided at initiation`);
                if(dto.productId) throw new BadRequestException(`General buy request doesn't require a productId to be provided at initiation`);
            }

            // Allowed docsize - 2mb
            const docSize = 2 * 1024 * 1024;
            // Validate doc strings
            // if (!isValidImageType(purchaseOrderDoc)) 
            //     throw new BadRequestException('PurchaseOrderDoc: Only jpeg/png images are allowed');

            // if (!isValidBase64Size(purchaseOrderDoc, docSize))
            //     throw new BadRequestException('PurchaseOrderDoc: Image size must be 2MB or less');

            const detected = detectMimeTypeFromBase64(purchaseOrderDoc);

            if (!detected || !this.supported.includes(detected)) {
                throw new BadRequestException( 'PurchaseOrderDoc must be JPEG, PNG, or PDF format.' );
            }

            // Validate size: 2MB
            if (!isValidBase64SizeGeneric(purchaseOrderDoc, docSize)) {
                throw new BadRequestException('PurchaseOrderDoc must be 2MB or less.');
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

            // Upload doc
            const uploadedDoc = await this.fileService.uploadFile(purchaseOrderDoc, `PurchaseOrderDoc`, savedBuyRequest);

            // Attach OneToOne so TypeORM does not break
            savedBuyRequest.purchaseOrderDoc = uploadedDoc;
            await this.buyRequestsRepository.save(savedBuyRequest);

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
                // OrderState updates
                buyRequest.orderState = OrderState.AWAITING_SHIPPING;
                buyRequest.orderStateTime = new Date();
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
                    // OrderState updates
                    buyRequest.orderState = OrderState.AWAITING_SHIPPING;
                    buyRequest.orderStateTime = new Date();
                }
            }

            const savedBuyRequest = await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 200,
                message: `BuyRequest status updated successfully`,
                data: instanceToPlain(savedBuyRequest)
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred, while updating BuyRequest status');
        }
    }

    async updateOrderState(dto: UpdateOrderStateDto, currentUser: User): Promise<any> {
        try {
                const buyRequest = await this.buyRequestsRepository.findOne({
                    where: { id: dto.buyRequestId, isDeleted: false },
                    relations: ['buyer', 'seller'],
                });

                if (!buyRequest) {
                    throw new NotFoundException('BuyRequest not found');
                }

            // ROLE-BASED LOGIC
            const isAdmin = currentUser.role === UserRole.ADMIN || UserRole.SUPER_ADMIN;
            const isBuyer = currentUser.id === buyRequest.buyer?.id;

            // 1️⃣ Only Admin or Buyer-Linked-to-Request can access this endpoint
            if (!isAdmin && !isBuyer) {
                throw new ForbiddenException('You are not authorized to update order state for this request');
            }

            // 2️⃣ Handle state-specific permissions
            if (dto.orderState === OrderState.IN_TRANSIT && !isAdmin) {
                throw new ForbiddenException('Only admin can set order state to in_transit');
            }

            if (dto.orderState === OrderState.AWAITING_SHIPPING) {
                throw new ForbiddenException('Order cannot be manually reverted to awaiting_shipping');
            }

            if (dto.orderState === OrderState.DELIVERED && !isAdmin && !isBuyer) {
                throw new ForbiddenException('Only buyer or admin can mark as DELIVERED');
            }

            if (dto.orderState === OrderState.COMPLETED) {
                throw new ForbiddenException('Order completion is automated');
            }

            // ✅ HANDLE ADMIN CONFIRM PAYMENT → IN_TRANSIT
            if (isAdmin && dto.orderState === OrderState.IN_TRANSIT) {
                // Convert string values to numbers safely
                const quantity = parseFloat(buyRequest.productQuantity);
                const pricePerUnit = parseFloat(buyRequest.pricePerUnitOffer);

                if (isNaN(quantity) || isNaN(pricePerUnit)) {
                    throw new BadRequestException('Invalid productQuantity or pricePerUnitOffer format');
                }

                // Calculate total = quantity × price per unit
                const totalAmount = (quantity * pricePerUnit).toFixed(2); // 2 decimal places
                
                buyRequest.paymentAmount = totalAmount.toString(); // store as string
                buyRequest.paymentConfirmed = true;
                buyRequest.paymentConfirmedAt = new Date();
            }

            // ✅ Update orderState + orderStateTime
            buyRequest.orderState = dto.orderState;
            buyRequest.orderStateTime = new Date();

            const updatedBuyRequest = await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 200,
                message: `Order state updated to ${dto.orderState}`,
                data: instanceToPlain(updatedBuyRequest),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while updating order state');
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

    async findMyBuyRequests(
        currentUser: User,
        status?: BuyRequestStatus,
        pageNumber: number = 1,
        pageSize: number = 20,
    ): Promise<any> {
        try {
            const skip = (pageNumber - 1) * pageSize;

            // Determine allowed statuses based on role
            let allowedStatuses: BuyRequestStatus[];

            if (currentUser.role === UserRole.FARMER) {
                // Farmers can only see requests where they are the seller
                // and only if status is ACCEPTED or REJECTED
                allowedStatuses = [
                    BuyRequestStatus.PENDING,
                    BuyRequestStatus.ACCEPTED, 
                    BuyRequestStatus.REJECTED
                ];
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

            // QueryBuilder for robust relational filtering
            const qb = this.buyRequestsRepository
                .createQueryBuilder('buyRequest')
                .leftJoinAndSelect('buyRequest.cropType', 'cropType')
                .leftJoinAndSelect('buyRequest.qualityStandardType', 'qualityStandardType')
                .leftJoinAndSelect('buyRequest.buyer', 'buyer')
                .leftJoinAndSelect('buyRequest.seller', 'seller')
                .leftJoinAndSelect('buyRequest.product', 'product')
                .where('buyRequest.isDeleted = false');

            if (status) {
                qb.andWhere('buyRequest.status = :status', { status });
            } else {
                qb.andWhere('buyRequest.status IN (:...statuses)', { statuses: allowedStatuses });
            }

            if (currentUser.role === UserRole.FARMER) {
                qb.andWhere('buyRequest.sellerId = :userId', { userId: currentUser.id });
            } else if (currentUser.role === UserRole.PROCESSOR) {
                qb.andWhere('buyRequest.buyerId = :userId', { userId: currentUser.id });
            }

            qb.orderBy('buyRequest.createdAt', 'DESC')
                .skip(skip)
                .take(pageSize);

            const [items, totalRecord] = await qb.getManyAndCount();

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

    async findOngoingBuyRequestOrders(query: OngoingBuyRequestOrdersQueryDto) {
        try{
            const {
                search,
                state = OrderState.AWAITING_SHIPPING,
                pageNumber = 1,
                pageSize = 20,
            } = query;

            const skip = (pageNumber - 1) * pageSize;

            const qb = this.buyRequestsRepository
                .createQueryBuilder('buyRequest')
                .leftJoinAndSelect('buyRequest.buyer', 'buyer')
                .leftJoinAndSelect('buyRequest.seller', 'seller')
                .leftJoinAndSelect('buyRequest.cropType', 'crop')
                .where('buyRequest.isDeleted = false')
                .andWhere('buyRequest.orderState = :state', { state });

            // Apply search filter
            if (search) {
                qb.andWhere(
                    `(
                        LOWER(buyer.firstName) LIKE :s OR
                        LOWER(buyer.lastName) LIKE :s OR
                        LOWER(buyer.farmAddress) LIKE :s OR
                        LOWER(buyer.country) LIKE :s OR
                        LOWER(buyer.state) LIKE :s OR
                        LOWER(buyer.farmName) LIKE :s OR

                        LOWER(seller.firstName) LIKE :s OR
                        LOWER(seller.lastName) LIKE :s OR
                        LOWER(seller.farmAddress) LIKE :s OR
                        LOWER(seller.country) LIKE :s OR
                        LOWER(seller.state) LIKE :s OR
                        LOWER(seller.farmName) LIKE :s OR

                        LOWER(crop.name) LIKE :s
                    )`,
                    { s: `%${search.toLowerCase()}%` },
                );
            }

            qb.orderBy('buyRequest.createdAt', 'DESC')
                .skip(skip)
                .take(pageSize);

            const [items, totalRecord] = await qb.getManyAndCount();

            return {
                statusCode: 200,
                message: 'Ongoing buyrequest orders fetched successfully',
                data: {
                    items: instanceToPlain(items),
                    totalRecord,
                    pageNumber,
                    pageSize,
                },
            };
        }catch (error) {
            handleServiceError(error, 'An error occurred while fetching ongoing buy requests');
        }
    }

    async findBuyRequest(buyRequestId: string): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({
                where: {
                    id: buyRequestId,
                    isDeleted: false,
                },
                relations: ['buyer', 'seller', 'product', 'qualityStandardType', 'purchaseOrderDoc']
            });

            if (!buyRequest) {
                throw new NotFoundException(`buyRequest not found`);
            }

            return {
                statusCode: 200,
                message: 'BuyRequest fetched successfully',
                data: instanceToPlain(buyRequest),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while fetching buyRequest');
        }
    }

    async findUserBuyRequests(userId: string): Promise<any> {
        try {
            // Check if user exists
            const user = await this.usersService.findUserEntity(userId);
            if (!user) throw new NotFoundException('User not found');

            // Determine which relation to filter by (buyer/seller)
            const query = this.buyRequestsRepository.createQueryBuilder('buyRequest')
                .leftJoinAndSelect('buyRequest.cropType', 'cropType')
                .leftJoinAndSelect('buyRequest.qualityStandardType', 'qualityStandardType')
                .leftJoinAndSelect('buyRequest.buyer', 'buyer')
                .leftJoinAndSelect('buyRequest.seller', 'seller')
                .leftJoinAndSelect('buyRequest.product', 'product')
                .where('buyRequest.isDeleted = false');

            if (user.role === UserRole.FARMER) {
                // Farmer: seller side — only accepted or rejected requests
                query.andWhere('seller.id = :userId', { userId })
                    .andWhere('buyRequest.status IN (:...statuses)', {
                        statuses: [
                            BuyRequestStatus.PENDING,
                            BuyRequestStatus.ACCEPTED, 
                            BuyRequestStatus.REJECTED
                        ],
                    });
            } else if (user.role === UserRole.PROCESSOR) {
                // Processor: buyer side — can see all their requests
                query.andWhere('buyer.id = :userId', { userId })
                    .andWhere('buyRequest.status IN (:...statuses)', {
                        statuses: [
                            BuyRequestStatus.PENDING,
                            BuyRequestStatus.ACCEPTED,
                            BuyRequestStatus.REJECTED,
                            BuyRequestStatus.CANCELLED,
                        ],
                    });
            } else {
                throw new BadRequestException('User role not authorized to view buy requests');
            }

            const buyRequests = await query
                .orderBy('buyRequest.createdAt', 'DESC')
                .getMany();


            return {
                statusCode: 200,
                message: 'User buy requests fetched successfully',
                data: buyRequests
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while fetching user buy requests');
        }
    }

    async uploadPurchaseOrderDoc(dto: UpdatePurchaseOrderDocDto): Promise<any> {
        try {
            const detected = detectMimeTypeFromBase64(dto.purchaseOrderDoc);

            if (!detected || !this.supported.includes(detected)) {
                throw new BadRequestException( 'PurchaseOrderDoc must be JPEG, PNG, or PDF format.' );
            }

            // Allowed docsize - 2mb
            const docSize = 2 * 1024 * 1024;

            // Validate size
            if (!isValidBase64SizeGeneric(dto.purchaseOrderDoc, docSize)) {
                throw new BadRequestException('PurchaseOrderDoc must be 2MB or less.');
            }

            const buyRequest = await this.buyRequestsRepository.findOne({
                where: { id: dto.buyRequestId, isDeleted: false },
                relations: ['purchaseOrderDoc'],
            });

            if (!buyRequest) {
                throw new NotFoundException(`buyRequest not found`);
            }

            // if old purchase order doc exists
            if(buyRequest.purchaseOrderDoc){
                await this.fileService.removeFile(buyRequest.purchaseOrderDoc.id); 
            }

            // Upload doc
            const uploaded = await this.fileService.uploadFile(dto.purchaseOrderDoc, `PurchaseOrderDoc`, buyRequest);

            buyRequest.purchaseOrderDoc = uploaded;
            await this.buyRequestsRepository.save(buyRequest);

            return {
                statusCode: 201,
                message: 'Purchase order doc uploaded successfully',
                data: uploaded,
            };
        }catch (error) {
            handleServiceError(error, 'An error occurred while uploading document');
        }
    }

    async removePurchaseOrderDoc(documentId: string) {
        try {
            return await this.fileService.removeFile(documentId); // throws the correct removeFile-method exceptions
        } catch (error) {
            handleServiceError(error, 'An error occurred while removing document');
        }
    }

    async deleteRequest(id: string, currentUser: User): Promise<any> {
        try {
            const buyRequest = await this.buyRequestsRepository.findOne({ 
                where: { id } 
            });
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

    private supported = [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ];
}