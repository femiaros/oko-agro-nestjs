import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from "../users/entities/user.entity";
import { Crop } from "../crops/entities/crop.entity";
import { File } from "../files/entities/file.entity";
import { Certification } from "../certifications/entities/certification.entity";
import { QualityStandard } from "../quality-standards/entities/quality-standard.entity";
import { Product } from "src/products/entities/product.entity";
import { FarmerProductPhotoFile } from 'src/farmer-product-photo-files/entities/farmer-product-photo-file.entity';
import { Event } from 'src/events/entities/event.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { PurchaseOrderDocFile } from 'src/purchase-order-doc-files/entities/purchase-order-doc-file.entity';
import { Dispute } from 'src/disputes/entities/dispute.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { ProductInventory } from 'src/product-inventories/entities/product-inventory.entity';

dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
  synchronize: false,
  entities: [
    User, Crop, File, Certification, QualityStandard, 
    Product, FarmerProductPhotoFile, Event, BuyRequest, 
    PurchaseOrderDocFile, Notification, Dispute, Rating, ProductInventory
  ], // ✅ Explicit entities for CLI
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
  logging: process.env.NODE_ENV !== 'production',
});