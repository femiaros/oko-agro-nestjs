import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { FarmerProductPhotoFilesModule } from 'src/farmer-product-photo-files/farmer-product-photo-files.module';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Crop]),
    FarmerProductPhotoFilesModule,
    EventsModule,
    AuthModule,
    UsersModule
  ], 
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
