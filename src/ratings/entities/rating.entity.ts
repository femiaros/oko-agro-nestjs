import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';

export enum RatingRole {
    BUYER = 'buyer',
    SELLER = 'seller',
}

@Entity('ratings')
@Unique('uq_rating_per_buyrequest_per_rater', ['buyRequest', 'rater'])
@Index(['ratee'])
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* -------------------- Relations -------------------- */

    @ManyToOne(() => BuyRequest, { onDelete: 'CASCADE' })
    buyRequest: BuyRequest;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    rater: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    ratee: User;

    /* -------------------- Role snapshot -------------------- */

    @Column({ type: 'enum', enum: RatingRole })
    raterRole: RatingRole;

    @Column({ type: 'enum', enum: RatingRole })
    rateeRole: RatingRole;

    /* -------------------- Rating data -------------------- */

    @Column({ type: 'int' })
    score: number; // 1 – 5 (validated at DTO level)

    @Column({ type: 'text', nullable: true })
    comment: string | null;

    /* -------------------- Meta -------------------- */
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}