import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager  } from 'typeorm';
import Decimal from 'decimal.js';
import { ProductInventory, ProductInventoryType } from './entities/product-inventory.entity';
import { Product } from 'src/products/entities/product.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { GetInventoriesQueryDto } from './dtos/get-inventories-query.dto';

// Decimal.set({
//   precision: 40, // higher than DB precision (30)
//   rounding: Decimal.ROUND_HALF_UP,
// });

@Injectable()
export class ProductInventoriesService {
    private readonly logger = new Logger(ProductInventoriesService.name);

    constructor(
        @InjectRepository(ProductInventory)
        private readonly productInventoryRepo: Repository<ProductInventory>,

        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,

        @InjectRepository(BuyRequest)
        private readonly buyRequestRepo: Repository<BuyRequest>,

        private readonly dataSource: DataSource,
    ) {}

    /**
    * Reserve stock (BuyRequest ACCEPTED)
    */
    async reserveStock(
        productId: string,
        quantityKg: string,
        buyRequestId: string,
        manager?: EntityManager,
    ): Promise<void> {
        try {
            const em = manager ?? this.dataSource.manager;

            const product = await em.findOne(Product, {
                where: { id: productId, isDeleted: false },
            });

            if (!product) {
                throw new Error('Product not found or deleted');
            }

            const buyRequest = await em.findOne(BuyRequest, {
                where: { id: buyRequestId, isDeleted: false },
            });

            if (!buyRequest) {
                throw new Error('Buy request not found or deleted');
            }

            const quantity = new Decimal(quantityKg);
            const totalQuantity = new Decimal(product.quantityKg);
            const reservedQuantity = new Decimal(product.reservedQuantityKg);

            const available = totalQuantity.minus(reservedQuantity);

            if (quantity.greaterThan(available)) {
                throw new Error('Insufficient available stock');
            }

            const newReserved = reservedQuantity.plus(quantity);

            product.reservedQuantityKg = newReserved.toDecimalPlaces(2).toFixed(2);

            await em.save(Product, product);

            const inventory = em.create(ProductInventory, {
                product,
                buyRequest,
                quantityKg: quantity.toDecimalPlaces(2).toFixed(2),
                type: ProductInventoryType.RESERVATION,
            });

            await em.save(ProductInventory, inventory);
        } catch (error) {
            this.logger.error( 'Error while reserving product stock', error.stack );
            handleServiceError( error, 'An error occurred while reserving product stock' );
        }
    }

    /**
    * Release reserved stock (BuyRequest CANCELLED / REJECTED)
    */
    async releaseStock(
        productId: string,
        quantityKg: string,
        buyRequestId: string,
        manager?: EntityManager,
    ): Promise<void> {
        try {
            const em = manager ?? this.dataSource.manager;

            const product = await em.findOne(Product, {
                where: { id: productId, isDeleted: false },
            });

            if (!product) {
                throw new Error('Product not found or deleted');
            }

            const buyRequest = await em.findOne(BuyRequest, {
                where: { id: buyRequestId, isDeleted: false },
            });

            if (!buyRequest) {
                throw new Error('Buy request not found or deleted');
            }

            const quantity = new Decimal(quantityKg);
            const reservedQuantity = new Decimal(product.reservedQuantityKg);

            const newReserved = reservedQuantity.minus(quantity);

            if (newReserved.isNegative()) {
                throw new Error('Reserved quantity cannot be negative');
            }

            product.reservedQuantityKg = newReserved.toDecimalPlaces(2).toFixed(2);

            await em.save(Product, product);

            const inventory = em.create(ProductInventory, {
                product,
                buyRequest,
                quantityKg: quantity.toDecimalPlaces(2).toFixed(2),
                type: ProductInventoryType.RELEASE,
            });

            await em.save(ProductInventory, inventory);
        } catch (error) {
            this.logger.error('Error while releasing reserved stock', error.stack);
            handleServiceError( error,'An error occurred while releasing reserved stock');
        }
    }

    /**
    * Deduct stock permanently (Order COMPLETED)
    */
    async deductStock(
        productId: string,
        quantityKg: string,
        buyRequestId: string,
        manager?: EntityManager,
    ): Promise<void> {
        try {
            const em = manager ?? this.dataSource.manager;

            const product = await em.findOne(Product, {
                where: { id: productId, isDeleted: false },
            });

            if (!product) {
                throw new Error('Product not found or deleted');
            }

            const buyRequest = await em.findOne(BuyRequest, {
                where: { id: buyRequestId, isDeleted: false },
            });

            if (!buyRequest) {
                throw new Error('Buy request not found or deleted');
            }

            const quantity = new Decimal(quantityKg);
            const totalQuantity = new Decimal(product.quantityKg);
            const reservedQuantity = new Decimal(product.reservedQuantityKg);

            const newTotal = totalQuantity.minus(quantity);
            const newReserved = reservedQuantity.minus(quantity);

            if (newTotal.isNegative() || newReserved.isNegative()) {
                throw new Error('Invalid deduction operation');
            }

            product.quantityKg = newTotal.toDecimalPlaces(2).toFixed(2);

            product.reservedQuantityKg = newReserved.toDecimalPlaces(2).toFixed(2);

            await em.save(Product, product);

            const inventory = em.create(ProductInventory, {
                product,
                buyRequest,
                quantityKg: quantity.toDecimalPlaces(2).toFixed(2),
                type: ProductInventoryType.DEDUCTION,
            });

            await em.save(ProductInventory, inventory);
        } catch (error) {
            this.logger.error('Error while deducting product stock', error.stack );
            handleServiceError( error, 'An error occurred while deducting product stock' );
        }
    }

    /**
    * Add stock (Farmer increases inventory)
    */
    async addStock(
        productId: string,
        quantityKg: string,
        manager?: EntityManager,
    ): Promise<void> {
        try {
            const em = manager ?? this.dataSource.manager;

            const product = await em.findOne(Product, {
                where: { id: productId, isDeleted: false },
            });

            if (!product) {
                throw new Error('Product not found or deleted');
            }

            const quantity = new Decimal(quantityKg);
            const totalQuantity = new Decimal(product.quantityKg);

            const newTotal = totalQuantity.plus(quantity);

            product.quantityKg = newTotal.toDecimalPlaces(2).toFixed(2);

            await em.save(Product, product);

            const inventory = em.create(ProductInventory, {
                product,
                quantityKg: quantity.toDecimalPlaces(2).toFixed(2),
                type: ProductInventoryType.ADDITION,
            });

            await em.save(ProductInventory, inventory);
        } catch (error) {
            this.logger.error( 'Error while adding product stock', error.stack );
            handleServiceError( error,'An error occurred while adding product stock' );
        }
    }

    async getInventories(query: GetInventoriesQueryDto) {
        try {
            const {
                search,
                type,
                pageNumber = '1',
                pageSize = '20',
            } = query;

            const page = parseInt(pageNumber, 10) || 1;
            const size = parseInt(pageSize, 10) || 20;
            const skip = (page - 1) * size;

            const qb = this.productInventoryRepo
                .createQueryBuilder('inventory')
                .leftJoinAndSelect('inventory.product', 'product')
                .leftJoinAndSelect('product.cropType', 'cropType')
                .orderBy('inventory.createdAt', 'DESC');

            // 🔍 Search filter (product.name OR cropType.name)
            if (search) {
                qb.andWhere(
                    `(LOWER(product.name) LIKE LOWER(:search)
                    OR LOWER(cropType.name) LIKE LOWER(:search))`,
                    { search: `%${search}%` },
                );
            }

            // 🔎 Inventory type filter
            if (type) {
                qb.andWhere('inventory.type = :type', { type });
            }

            qb.skip(skip).take(size);

            const [items, totalRecord] = await qb.getManyAndCount();

            return {
                statusCode: 200,
                message: 'Inventories fetched successfully',
                data: {
                    items,
                    totalRecord,
                    pageSize: size,
                    pageNumber: page,
                },
            };

        } catch (error) {
            this.logger.error('Failed to fetch inventories', error.stack);
            handleServiceError(error, 'Failed to fetch inventories');
        }
    }

    async getProductInventories(productId: string) {
        try {
            // Ensure product exists
            const product = await this.productRepo.findOne({
                where: { id: productId },
                select: ['id'],
            });

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            const inventories = await this.productInventoryRepo.find({
                where: {
                    product: {
                    id: productId,
                    },
                },
                relations: {
                    product: {
                    cropType: true,
                    },
                },
                order: {
                    createdAt: 'DESC',
                },
            });

            return {
                statusCode: 200,
                message: 'Product inventory logs fetched successfully',
                data: inventories,
            };

        } catch (error) {
            this.logger.error(
                `Failed to fetch inventory logs for product ${productId}`,
                error.stack,
            );

            handleServiceError(
                error,
                'Failed to fetch product inventory logs',
            );
        }
    }
    
}
