import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Index,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

export enum DisputeStatus {
    OPEN = 'open',
    UNDER_REVIEW = 'under_review',
    RESOLVED = 'resolved',
    REJECTED = 'rejected',
}

export enum DisputeInitiator {
    BUYER = 'buyer',
    SELLER = 'seller',
}

@Index(['buyRequest'])
@Index(['status'])
@Index(['initiatedBy'])
@Entity('disputes')
export class Dispute {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => BuyRequest, { onDelete: 'CASCADE' })
    buyRequest: BuyRequest;

    @ManyToOne(() => User)
    initiatedBy: User;

    @Column({ type: 'enum', enum: DisputeInitiator })
    initiatorType: DisputeInitiator;

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
    status: DisputeStatus;

    @Column({ type: 'text', nullable: true })
    resolvedBy: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    resolvedAt: Date | null;

    @Column({ type: 'text', nullable: true })
    rejectedBy: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    rejectedAt: Date | null;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
