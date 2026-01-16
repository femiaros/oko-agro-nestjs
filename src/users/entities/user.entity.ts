import { Exclude } from 'class-transformer';
import { Certification } from 'src/certifications/entities/certification.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { File } from 'src/files/entities/file.entity';
import { QualityStandard } from 'src/quality-standards/entities/quality-standard.entity';
import { Product } from 'src/products/entities/product.entity';
import { Event } from 'src/events/entities/event.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { Dispute } from 'src/disputes/entities/dispute.entity';

export enum UserRole {
  FARMER = 'farmer',
  PROCESSOR = 'processor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum FarmSizeUnit {
  HECTARE = 'hectare',
  ACRE = 'acre',
}

export enum EstimatedAnnualProductionUnit{
  KILOGRAM = 'kilogram',
  TONNE = 'tonne'
}

export enum BusinessType {
  FOODPROCESSING = 'food processing',
  OILMILL = 'oil mill',
  FLOORMILL = 'floor mill',
  RICEMILL = 'rice mill',
  CASSAVAPROCESSING = 'cassava processing',
  FRUITPROCESSING = 'fruit processing',
}

export enum ProcesssingCapacityUnit {
  TONS = 'tons'
}

export enum OperatingDaysPerWeek {
  SEVENDAYS = '7days',
  SIXDAYS = '6days',
  FIVEDAYS = '5days',
  SEASONALOPERATIONS = 'seasonal operation'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string; // hash will be saved here

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  farmAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  state: string | null;

  @Column({ type: 'varchar', nullable: true })
  farmName: string | null;

  @Column({ type: 'varchar', nullable: true })
  farmSize: string | null;

  @Column({ type: 'enum', enum: FarmSizeUnit, nullable: true })
  farmSizeUnit: FarmSizeUnit;

  @Column({ type: 'varchar', nullable: true })
  estimatedAnnualProduction: string | null;

  @Column({ type: 'enum', enum: EstimatedAnnualProductionUnit, nullable: true })
  estimatedAnnualProductionUnit: EstimatedAnnualProductionUnit;

  @Column({ type: 'varchar', nullable: true })
  farmingExperience: string | null;

  @Column({ type: 'varchar', nullable: true })
  internetAccess: string | null;

  @Column({ type: 'varchar', nullable: true })
  howUserSellCrops: string | null;

  @Column({ type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  // Processor Company specific Info
  @Column({ type: 'varchar', nullable: true })
  companyName: string | null;

  // @Column({ type: 'varchar', nullable: true })
  // companyContactPersonFullName: string | null;

  // @Column({ type: 'varchar', unique: true })
  // companyEmail: string;

  @Column({ type: 'varchar', nullable: true })
  businessRegNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  yearEstablished: string | null;

  @Column({ type: 'enum', enum: BusinessType, nullable: true })
  businessType: BusinessType;

  @Column({ type: 'varchar', nullable: true })
  processsingCapacitySize: string | null;

  @Column({ type: 'enum', enum: ProcesssingCapacityUnit, nullable: true })
  processsingCapacityUnit: ProcesssingCapacityUnit;

  @Column({ type: 'enum', enum: OperatingDaysPerWeek, nullable: true })
  operatingDaysPerWeek: OperatingDaysPerWeek;

  @Column({ type: 'varchar', nullable: true })
  storageCapacity: string | null;

  @Column({ type: 'varchar', nullable: true })
  minimumOrderQuality: string | null;

  @Column({ type: 'varchar', nullable: true })
  OperationsType: string | null;

  // User verification
  @Column({ type: 'boolean', default: false })
  userVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  userVerificationOtp: string | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  userVerificationOtpExpiryTime: Date | null;

  // Password reset
  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpiryTime: Date | null;

  @Exclude()
  @Column({ type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDisabled: boolean; // disable user account

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relation: User ↔ Certifications (many-to-many)
  @ManyToMany(() => Certification, (certification) => certification.users, { cascade: true })
  @JoinTable({
    name: 'user_certifications', // join table name
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'certificationId', referencedColumnName: 'id' },
  })
  certifications: Certification[];

  // Relation: User ↔ QualityStandards (many-to-many)
  @ManyToMany(() => QualityStandard, (qualityStandard) => qualityStandard.users, { cascade: true })
  @JoinTable({
    name: 'user_qualityStandards', // join table name
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'qualityStandardId', referencedColumnName: 'id' },
  })
  qualityStandards: QualityStandard[];

  // Products owned by this user
  @OneToMany(() => Product, (product) => product.owner)
  products: Product[];

  // Events created by this user
  @OneToMany(() => Event, (event) => event.owner)
  events: Event[];

  // Notifications created by this user
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Relation: User ↔ Crops (many-to-many)
  @ManyToMany(() => Crop, (crop) => crop.users, { cascade: true })
  @JoinTable({
    name: 'user_crops', // join table name
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cropId', referencedColumnName: 'id' },
  })
  crops: Crop[];

  // Relation: User ↔ Files (one-to-many)
  @OneToMany(() => File, (file) => file.owner, { cascade: true })
  files: File[];

  // Relation: User(Buyer) ↔ BuyRequests (one-to-many)
  @OneToMany(() => BuyRequest, (buyRequest) => buyRequest.buyer)
  buyRequestsAsBuyer: BuyRequest[];

  // Relation: User(Seller) ↔ BuyRequests (one-to-many)
  @OneToMany(() => BuyRequest, (buyRequest) => buyRequest.seller)
  buyRequestsAsSeller: BuyRequest[];

  // Relation: User can initiate many disputes
  @OneToMany(() => Dispute, (dispute) => dispute.initiatedBy)
  disputes: Dispute[];

}