import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { Product } from 'src/products/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BuyRequest, Product]),
    AuthModule
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
