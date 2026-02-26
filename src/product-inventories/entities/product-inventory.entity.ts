import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';

export enum ProductInventoryType {
    ADDITION = 'addition',
    RESERVATION = 'reservation',
    RELEASE = 'release',
    DEDUCTION = 'deduction',
}

@Entity('product_inventories')
export class ProductInventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Related product
     */
    @ManyToOne(() => Product, (product) => product.inventories, {
        onDelete: 'CASCADE',
    })
    product: Product;

    /**
     * Related buy request (nullable)
     * Used for reservation / release / deduction tracking
     */
    @ManyToOne(() => BuyRequest, (buyRequest) => buyRequest.inventoryMovements, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    buyRequest: BuyRequest | null;

    /**
     * Quantity moved (always in KG)
     */
    @Column({ type: 'decimal', precision: 30, scale: 2 })
    quantityKg: string;

    /**
     * Movement type
     */
    @Column({
        type: 'enum',
        enum: ProductInventoryType,
    })
    type: ProductInventoryType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}