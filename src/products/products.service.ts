import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmerProductPhotoFilesService } from 'src/farmer-product-photo-files/farmer-product-photo-files.service';
import { EventsService } from 'src/events/events.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { User } from 'src/users/entities/user.entity';
import { isValidImageType, isValidBase64Size } from 'src/common/utils/base64.util';
import { EventReferenceType } from 'src/events/entities/event.entity';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateProductPhotosDto } from './dtos/update-product-photos.dto';
import { FarmerProductPhotoFile } from 'src/farmer-product-photo-files/entities/farmer-product-photo-file.entity';
import { UsersService } from 'src/users/users.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private readonly productsRepository: Repository<Product>,
        @InjectRepository(Crop) private readonly cropsRepository: Repository<Crop>,
        private readonly photoService: FarmerProductPhotoFilesService,
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
    ) {}

    async createProduct(dto: CreateProductDto, currentUser: User): Promise<any> {
        try{
            const { cropId, photos, ...productData } = dto;

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
                    owner,
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

            if (!product) throw new NotFoundException('Product not found or doesnot belong to this user');

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

    async findUserProducts(userId: string): Promise<any> {
        try {
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
                message: 'User products fetched successfully',
                data: instanceToPlain(products),
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
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
                statusCode: 200,
                message: 'Product photos uploaded successfully!',
                data: uploadedPhotos,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
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
