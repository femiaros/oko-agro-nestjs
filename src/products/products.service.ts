import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductApprovalStatus } from './entities/product.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmerProductPhotoFilesService } from 'src/farmer-product-photo-files/farmer-product-photo-files.service';
import { EventsService } from 'src/events/events.service';
import { In, Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { isValidImageType, isValidBase64Size } from 'src/common/utils/base64.util';
import { EventReferenceType } from 'src/events/entities/event.entity';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductPhotosDto } from './dtos/update-product-photos.dto';
import { FarmerProductPhotoFile } from 'src/farmer-product-photo-files/entities/farmer-product-photo-file.entity';
import { UsersService } from 'src/users/users.service';
import { instanceToPlain } from 'class-transformer';
import { AdminApprovalAction, UpdateProductApprovalDto } from './dtos/update-product-approval.dto';
import { ProductListingQueryDto } from './dtos/product-listing-query.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType, RelatedEntityType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        @InjectRepository(Crop) private readonly cropsRepository: Repository<Crop>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly notificationsService: NotificationsService,
        private readonly photoService: FarmerProductPhotoFilesService,
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
    ) {}

    async createProduct(dto: CreateProductDto, currentUser: User): Promise<any> {
        try{
            const { cropId, photos, ...productData } = dto;

            // Check if harvestDate is in the past
            const today = new Date();
            if (dto.harvestDate && new Date(dto.harvestDate) <= today) {
                throw new BadRequestException('harvestDate must be a future date');
            }

            // Allowed photosize - 2mb
            const photosize = 2 * 1024 * 1024;
            // Validate photo strings
            for (let i = 0; i < photos.length; i++) {
                if (!isValidImageType(photos[i])) 
                    throw new BadRequestException('productPhoto: Only jpeg/png images are allowed');

                if (!isValidBase64Size(photos[i], photosize))
                    throw new BadRequestException('productPhoto: Image size must be 2MB or less');
            }

            const owner = await this.usersService.findUserEntity(currentUser.id);

            const crop = await this.cropsRepository.findOne({ where: { id: cropId } });
            if (!crop) throw new BadRequestException('Invalid cropId');

            const product = this.productsRepository.create({
                ...productData,
                cropType: crop,
                owner,
                approvalStatus: ProductApprovalStatus.PENDING, 
            });

            const savedProduct = await this.productsRepository.save(product);

            // Upload photos
            for (let i = 0; i < photos.length; i++) {
                await this.photoService.uploadFile(photos[i], `FarmerProductPhoto`, savedProduct);
            }

            // if harvestDate is provided - Create harvest event 
            if (dto.harvestDate) {
                await this.eventsService.createEvent({
                    name: 'Product Crop Harvest',
                    description: `${dto.name} harvest scheduled`,
                    referenceType: EventReferenceType.PRODUCT,
                    referenceId: savedProduct.id,
                    product: savedProduct,
                    eventDate: dto.harvestDate,
                    isHarvestEvent: true,
                    owner,
                });
            }

            const admins = await this.usersRepository.find({
                where: {
                    role: In([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
                    isDeleted: false,
                },
            });

            for (const admin of admins) {
                await this.notificationsService.createNotification({
                    user: admin,
                    type: NotificationType.System,
                    title: `Pending Approval`,
                    message: 
                        `A new product with id: ${product.id} is pending approval`, 
                    relatedEntityType: RelatedEntityType.Product,
                    relatedEntityId: product.id
                });
            }


            return {
                statusCode: 201,
                message: 'Product created successfully!',
                data: instanceToPlain(savedProduct)
            };
        }catch(error){
            handleServiceError(error, 'An error occurred');
        }
    }

    async updateProduct(dto: UpdateProductDto, currentUser: User): Promise<any> { // , owner: User
        try {
            const product = await this.productsRepository.findOne({ 
                where: { 
                    id: dto.productId, 
                    owner: { id: currentUser.id },
                    isDeleted: false
                } 
            });

            if (!product) throw new NotFoundException("Product not found or doesn't belong to this user");

            for (const [key, value] of Object.entries(dto)) {
                if (key === 'productId') continue; // skip productId
                // if (key === 'cropId') continue; // skip cropId

                if (value !== undefined && value !== null) {
                    (product as any)[key] = value;
                }
            }

            // Handle cropType change
            // if (dto.cropId) {
            //     const crop = await this.cropsRepository.findOne({
            //         where: { id: dto.cropId },
            //     });

            //     if (!crop) {
            //         throw new BadRequestException('Invalid cropId');
            //     }

            //     product.cropType = crop;
            // }

            const savedProduct = await this.productsRepository.save(product);

            // if (dto.harvestDate) {
            //     if (product.harvestEvent) {
            //         await this.eventsService.updateEvent(product.harvestEvent.id, { eventDate: dto.harvestDate });
            //     }
            // }

            return {
                statusCode: 200,
                message: 'Product updated successfully!',
                data: instanceToPlain(savedProduct)
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async findUserProducts(userId: string, currentUser: User): Promise<any> {
        try {
            if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN.toString()){
                throw new UnauthorizedException("Current logged-in user or an admin user can access resource");
            }

            const products = await this.productsRepository.find({
                where: {
                    owner: { id: userId },
                    isDeleted: false,
                },
                relations: ['owner', 'cropType', 'photos', 'harvestEvent'],
                order: { createdAt: 'DESC' },
            });

            return {
                statusCode: 200,
                message: 'User product(s) fetched successfully',
                data: instanceToPlain(products),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async findApprovedUserProducts(userId: string): Promise<any> {
        try {
            // Validate user exists
            const user = await this.usersService.findUserEntity(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Fetch approved products linked to this owner
            const approvedProducts = await this.productsRepository.find({
                where: {
                    owner: { id: userId },
                    approvalStatus: ProductApprovalStatus.APPROVED,
                    isDeleted: false,
                },
                relations: ['cropType', 'photos', 'owner'],
                order: { createdAt: 'DESC' },
            });

            return {
                statusCode: 200,
                message: 'Approved product(s) fetched successfully',
                data: instanceToPlain(approvedProducts),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while fetching approved user products');
        }
    }

    async findProductListings(query: ProductListingQueryDto) {
        try{
            const {
                search,
                status = ProductApprovalStatus.PENDING,
                pageNumber = 1,
                pageSize = 20,
            } = query;

            const skip = (pageNumber - 1) * pageSize;

            const qb = this.productsRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.cropType', 'crop')
                .leftJoinAndSelect('p.owner', 'farmer')
                .where('p.isDeleted = false')
                .andWhere('p.approvalStatus = :status', { status });

            // Search filter
            if (search) {
                qb.andWhere(
                    `(
                        LOWER(p.name) LIKE :s OR
                        LOWER(p.locationAddress) LIKE :s OR

                        LOWER(crop.name) LIKE :s OR

                        LOWER(farmer.firstName) LIKE :s OR
                        LOWER(farmer.lastName) LIKE :s OR
                        LOWER(farmer.farmAddress) LIKE :s OR
                        LOWER(farmer.country) LIKE :s OR
                        LOWER(farmer.state) LIKE :s OR
                        LOWER(farmer.farmName) LIKE :s
                    )`,
                    { s: `%${search.toLowerCase()}%` },
                );
            }

            qb.orderBy('p.createdAt', 'DESC')
                .skip(skip)
                .take(pageSize);

            const [items, totalRecord] = await qb.getManyAndCount();

            return {
                statusCode: 200,
                message: 'Product listings fetched successfully',
                data: {
                    items: instanceToPlain(items),
                    totalRecord,
                    pageNumber,
                    pageSize,
                },
            };
        }catch (error) {
            handleServiceError(error, 'An error occurred while fetching product listings');
        }
    }

    async findProduct(productId: string): Promise<any> {
        try {
            const product = await this.productsRepository.findOne({
                where: {
                    id: productId,
                    isDeleted: false,
                },
                relations: ['owner', 'cropType', 'photos', 'harvestEvent'],
            });

            if (!product) {
                throw new NotFoundException(`Product not found or has been deleted`);
            }

            return {
                statusCode: 200,
                message: 'Product fetched successfully',
                data: instanceToPlain(product),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async removeProductPhoto(photoId: string) {
        try {
            return await this.photoService.removeFile(photoId); // throws the correct removeFile-method exceptions
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async uploadProductPhotos(dto: UpdateProductPhotosDto): Promise<any> {
        try {
            // Allowed photosize - 2mb
            const photosize = 2 * 1024 * 1024;
            // Validate photo strings
            for (let i = 0; i < dto.photos.length; i++) {
                if (!isValidImageType(dto.photos[i])) 
                    throw new BadRequestException('productPhoto: Only jpeg/png images are allowed');

                if (!isValidBase64Size(dto.photos[i], photosize))
                    throw new BadRequestException('productPhoto: Image size must be 2MB or less');
            }

            const product = await this.productsRepository.findOne({
                where: { id: dto.productId, isDeleted: false },
                relations: ['photos'],
            });

            if (!product) {
                throw new NotFoundException(`Product not found`);
            }

            // Enforce max of 2 photos (for now)
            if (product.photos.length >= 2) {
                throw new BadRequestException(`Product already has the maximum of 2 photos` );
            }

            const uploadedPhotos: FarmerProductPhotoFile[] = [];

            for (const photo of dto.photos) {
                if (product.photos.length >= 2) {
                    throw new BadRequestException(`Maximum of 2 photos reached, cannot upload more` );
                }

                const uploaded = await this.photoService.uploadFile(photo, 'FarmerProductPhoto', product);

                uploadedPhotos.push(uploaded);
                product.photos.push(uploaded);
            }

            await this.productsRepository.save(product);

            return {
                statusCode: 201,
                message: 'Product photos uploaded successfully!',
                data: uploadedPhotos,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async updateProductApproval(dto: UpdateProductApprovalDto): Promise<any> {
        try {
            const { productId, approvalStatus } = dto;

            const product = await this.productsRepository.findOne({
                where: { id: productId, isDeleted: false },
                relations: [
                    'cropType',
                    'owner',
                ],
            });

            if (!product) throw new NotFoundException('Product not found');

            // map admin input to internal enum
            let newStatus: ProductApprovalStatus;
            if (approvalStatus === AdminApprovalAction.APPROVE) {
                newStatus = ProductApprovalStatus.APPROVED;
            } else if (approvalStatus === AdminApprovalAction.REJECT) {
                newStatus = ProductApprovalStatus.REJECTED;
            } else {
                throw new BadRequestException('Invalid approvalStatus value');
            }

            // prevent re-approval of already approved/rejected products
            if (product.approvalStatus === newStatus) {
                throw new BadRequestException(`Product is already ${newStatus}`);
            }

            product.approvalStatus = newStatus;
            const updatedProduct = await this.productsRepository.save(product);

            if (approvalStatus === AdminApprovalAction.APPROVE) {
                const processors = await this.usersRepository.find({
                    where: {
                        role: UserRole.PROCESSOR,
                        isDeleted: false,
                    },
                });

                for (const processor of processors) {
                    await this.notificationsService.createNotification({
                        user: processor,
                        type: NotificationType.System,
                        title: `New Product Availability`,
                        message: 
                            `New ${product.cropType.name.toLowerCase()} is now available on the system. Product was uploaded by ${product.owner.farmName?.toUpperCase()}`, 
                        relatedEntityType: RelatedEntityType.Product,
                        relatedEntityId: product.id
                    });
                }

            }


            return {
                statusCode: 200,
                message: `Product ${newStatus} successfully`,
                data: instanceToPlain(updatedProduct)
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while updating product approval');
        }
    }

    async deleteProduct(productId: string, currentUser: User): Promise<any> {
        try {
            const owner = await this.usersService.findUserEntity(currentUser.id);

            const product = await this.productsRepository.findOne({
                where: { id: productId, owner: { id: owner.id }, isDeleted: false },
                relations: ['harvestEvent'], // include event relation
            });

            if (!product) {
                throw new NotFoundException("Product not found or product doesn't belong to this user");
            }

            // Mark product as deleted
            product.isDeleted = true;
            await this.productsRepository.save(product);

            // If harvest event exists, also mark it deleted
            if (product.harvestEvent) {
                product.harvestEvent.isDeleted = true;
                await this.eventsService.removeEvent(product.harvestEvent.id, owner);
            }

            return {
                statusCode: 200,
                message: 'Product deleted successfully',
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

}
