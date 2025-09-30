import { Module } from '@nestjs/common';
import { BuyRequestsService } from './buy-requests.service';
import { BuyRequestsController } from './buy-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { BuyRequest } from './entities/buy-request.entity';
import { Crop } from 'src/crops/entities/crop.entity';
import { QualityStandard } from 'src/quality-standards/entities/quality-standard.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuyRequest, Crop, QualityStandard, Product]),
    AuthModule,
    UsersModule
  ],
  providers: [BuyRequestsService],
  controllers: [BuyRequestsController]
})
export class BuyRequestsModule {}
