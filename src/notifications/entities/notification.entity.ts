import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum NotificationType {
  BuyRequest = 'buy_request',
  OrderStatus = 'order_status',
  Contact_Message = 'contact_message',
}

export enum RelatedEntityType {
  BuyRequest = 'buy_request',
  Product = 'product',
}

@Entity('notifications')
@Index(['user', 'isRead'])
@Index(['user', 'createdAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'enum', enum: RelatedEntityType })
    relatedEntityType: RelatedEntityType;

    @Column({ type: 'uuid', nullable: true })
    relatedEntityId: string | null;

    @Column({ type: 'uuid', nullable: true })
    senderId: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    senderName: string | null;

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
