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

export enum ProductQuantityUnit {
  KILOGRAM = 'kilogram',
  TONNE = 'tonne',
}

export enum ProductPriceCurrency {
  NGN = 'ngn'
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToOne(() => Crop, (crop) => crop.products, { eager: true })
  cropType: Crop;

  @Column({ type: 'varchar' })
  quantity: string;

  @Column({ type: 'enum', enum: ProductQuantityUnit })
  quantityUnit: ProductQuantityUnit;

  @Column({ type: 'varchar' })
  pricePerUnit: string;

  @Column({ type: 'enum', enum: ProductPriceCurrency, default: ProductPriceCurrency.NGN })
  priceCurrency: ProductPriceCurrency;

  @Column({ type: 'varchar', nullable: true })
  locationAddress: string | null;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => FarmerProductPhotoFile, (photo) => photo.product, { cascade: true })
  photos: FarmerProductPhotoFile[];

  @OneToOne(() => Event, (event) => event.product, { nullable: true, cascade: true })
  harvestEvent: Event | null;

  @OneToMany(() => BuyRequest, (buyRequest) => buyRequest.product)
  buyRequests: BuyRequest[];

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}