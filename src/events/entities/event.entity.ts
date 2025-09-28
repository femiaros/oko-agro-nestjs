import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

export enum EventStatus {
  UPCOMING = 'upcoming',
  TODAY = 'today',
  CONCLUDED = 'concluded',
}

export enum EventReferenceType {
  PRODUCT = 'product',
  CUSTOM = 'custom',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({type: 'enum', enum: EventReferenceType, nullable: true })
  referenceType: EventReferenceType | null;

  @Column({ type: 'timestamptz' })
  eventDate: Date;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING })
  status: EventStatus;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  owner: User;

  @OneToOne(() => Product, (product) => product.harvestEvent, { nullable: true })
  @JoinColumn()
  product: Product | null;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}