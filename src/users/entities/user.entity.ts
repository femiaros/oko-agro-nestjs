import { Crop } from 'src/crops/entities/crop.entity';
import { File } from 'src/files/entities/file.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';

export enum UserRole {
  FARMER = 'farmer',
  PROCESSOR = 'processor',
  ADMIN = 'admin',
}

export enum FarmSizeUnit {
  HECTARE = 'hectare',
  ACRE = 'acre',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hash will be saved here

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  farmAddress: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  farmName: string;

  @Column({ type: 'decimal', nullable: true })
  farmSize: number;

  @Column({ type: 'enum', enum: FarmSizeUnit, nullable: true })
  unit: FarmSizeUnit;

  @Column({ nullable: true })
  estimatedAnnualProduction: string;

  @Column({ nullable: true })
  farmingExperience: string;

  @Column({ nullable: true })
  internetAccess: string;

  @Column({ nullable: true })
  howUserSellCrops: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  userVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  userVerificationOtp: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  userVerificationOtpExpiryTime: Date | null;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ✅ Relation: User ↔ Crops (many-to-many)
  @ManyToMany(() => Crop, (crop) => crop.users, { cascade: true })
  @JoinTable({
    name: 'user_crops', // join table name
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cropId', referencedColumnName: 'id' },
  })
  crops: Crop[];

  // ✅ Relation: User ↔ Files (one-to-many)
  @OneToMany(() => File, (file) => file.owner, { cascade: true })
  files: File[];
}