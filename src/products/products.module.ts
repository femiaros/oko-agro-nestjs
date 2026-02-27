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
import { User } from 'src/users/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Crop, User]),
    FarmerProductPhotoFilesModule,
    EventsModule,
    AuthModule,
    UsersModule,
    NotificationsModule
  ], 
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
