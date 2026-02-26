import { BuyRequest } from "src/buy-requests/entities/buy-request.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('quality_standards')
export class QualityStandard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => User, (user) => user.qualityStandards)
    users: User[];

    // one quality standard can be used by many buy requests
    @OneToMany(() => BuyRequest, (buyRequest) => buyRequest.qualityStandardType)
    buyRequests: BuyRequest[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}