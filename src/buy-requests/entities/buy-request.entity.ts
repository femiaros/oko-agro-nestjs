import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Crop } from 'src/crops/entities/crop.entity';
import { QualityStandard } from 'src/quality-standards/entities/quality-standard.entity';
import { User } from 'src/users/entities/user.entity';
import { Product, ProductQuantityUnit } from 'src/products/entities/product.entity';

export enum BuyRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled', 
}

export enum PaymentMethod {
  PAY_ON_DELIVERY = 'pay_on_delivery',
}

export enum BuyRequestQuantityUnit {
  KILOGRAM = 'kilogram',
  TONNE = 'tonne',
}

export enum OrderState {
  AWAITING_SHIPPING = 'awaiting_shipping',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
}


@Entity('buy_requests')
export class BuyRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  requestNumber: number; // sequential unique number

  // @Column({ type: 'varchar', nullable: true })
  @Column({ type: 'varchar' })
  description: string | null;

  @ManyToOne(() => Crop, { eager: true })
  cropType: Crop;

  @ManyToOne(() => QualityStandard, { eager: true, nullable: true })
  qualityStandardType: QualityStandard | null;

  @Column({ type: 'varchar' })
  productQuantity: string;

  @Column({ type: 'enum', enum: BuyRequestQuantityUnit })
  productQuantityUnit: BuyRequestQuantityUnit;

  @Column({ type: 'varchar' })
  pricePerUnitOffer: string;

  @Column({ type: 'timestamptz' })
  estimatedDeliveryDate: Date;

  @Column({ type: 'varchar' })
  deliveryLocation: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.PAY_ON_DELIVERY })
  preferredPaymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: BuyRequestStatus, default: BuyRequestStatus.PENDING })
  status: BuyRequestStatus;

  @Column({ default: false })
  isGeneral: boolean;

  @ManyToOne(() => User, (user) => user.buyRequestsAsBuyer, { eager: true })
  buyer: User;

  @ManyToOne(() => User, (user) => user.buyRequestsAsSeller, { nullable: true, eager: true })
  seller: User | null;
  
  @ManyToOne(() => Product, (product) => product.buyRequests, { nullable: true })
  product: Product | null;

  @Column({ type: 'enum', enum: OrderState, nullable: true })
  orderState: OrderState | null;

  @Column({ type: 'timestamptz', nullable: true })
  orderStateTime: Date | null;
  
  @Column({ type: 'varchar' })
  paymentAmount: string;

  @Column({ type: 'boolean', default: false })
  paymentConfirmed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  paymentConfirmedAt: Date | null;  

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}