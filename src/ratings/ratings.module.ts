import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/users/entities/user.entity';
import { Rating } from './entities/rating.entity';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuyRequest, Rating, User]),
    AuthModule,
    NotificationsModule
  ],
  providers: [RatingsService],
  controllers: [RatingsController]
})
export class RatingsModule {}
