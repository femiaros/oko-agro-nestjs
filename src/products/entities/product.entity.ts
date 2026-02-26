import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Crop } from 'src/crops/entities/crop.entity';
import { User } from 'src/users/entities/user.entity';
import { FarmerProductPhotoFile } from 'src/farmer-product-photo-files/entities/farmer-product-photo-file.entity';
import { Event } from 'src/events/entities/event.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { ProductInventory } from 'src/product-inventories/entities/product-inventory.entity';

// export enum ProductQuantityUnit {
//   KILOGRAM = 'kilogram',
//   TONNE = 'tonne',
// }

export enum ProductPriceCurrency {
  NGN = 'ngn'
}

export enum ProductApprovalStatus {
  PENDING = 'pending',     // waiting for admin review
  APPROVED = 'approved',   // visible on platform
  REJECTED = 'rejected',   // rejected by admin
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToOne(() => Crop, (crop) => crop.products, { eager: false })
  cropType: Crop;

  /**
   * Total quantity available (in KG)
   * Stored as DECIMAL(30,2) for very large precision-safe values
   */
  @Column({ type: 'decimal', precision: 30, scale: 2, default: 0 })
  quantityKg: string;

  /**
   * Reserved quantity (ACCEPTED but not COMPLETED)
   */
  @Column({ type: 'decimal', precision: 30, scale: 2, default: 0 })
  reservedQuantityKg: string;

  /**
   * Price per KG (2 decimal fixed)
   */
  @Column({ type: 'decimal', precision: 30, scale: 2 })
  pricePerKg: string;

  @Column({ type: 'enum', enum: ProductPriceCurrency, default: ProductPriceCurrency.NGN })
  priceCurrency: ProductPriceCurrency;

  @Column({ type: 'varchar', nullable: true })
  locationAddress: string | null;

  @Column({ type: 'enum', enum: ProductApprovalStatus, default: ProductApprovalStatus.PENDING })
  approvalStatus: ProductApprovalStatus;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => FarmerProductPhotoFile, (photo) => photo.product, { cascade: true })
  photos: FarmerProductPhotoFile[];

  @OneToOne(() => Event, (event) => event.product, { nullable: true, cascade: true })
  harvestEvent: Event | null;

  @OneToMany(() => BuyRequest, (buyRequest) => buyRequest.product)
  buyRequests: BuyRequest[];

  /**
   * Inventory movement history
   */
  @OneToMany(() => ProductInventory, (inventory) => inventory.product)
  inventories: ProductInventory[];

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}