import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Entity('farmer_product_photo_files')
export class FarmerProductPhotoFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // ✅ custom filename

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column()
  description: string; // product.name_description_random4digits

  @Column({ type: 'varchar', nullable: true })
  mimeType: string | null;

  @Column({ type: 'varchar', nullable: true })
  size: string | null;

  @ManyToOne(() => Product, (product) => product.photos, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}