import { Module } from '@nestjs/common';
import { ProductInventoriesService } from './product-inventories.service';
import { ProductInventoriesController } from './product-inventories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductInventory } from './entities/product-inventory.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { Product } from 'src/products/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductInventory, BuyRequest, Product]),
    AuthModule,
    // NotificationsModule
  ],
  providers: [ProductInventoriesService],
  controllers: [ProductInventoriesController],
  exports: [ProductInventoriesService]
})
export class ProductInventoriesModule {}
