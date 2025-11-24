import { BuyRequest } from "src/buy-requests/entities/buy-request.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('purchase_order_doc_files')
export class PurchaseOrderDocFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    url: string;

    @Column()
    publicId: string;

    @Column()
    description: string;

    @Column({ type: 'varchar', nullable: true })
    mimeType: string | null;

    @Column({ type: 'varchar', nullable: true })
    size: string | null;

    // The BuyRequest this document belongs to
    @OneToOne(() => BuyRequest, (req) => req.purchaseOrderDoc, { onDelete: 'CASCADE' })
    buyRequest: BuyRequest;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}