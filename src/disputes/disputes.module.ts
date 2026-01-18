import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { Dispute } from './entities/dispute.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuyRequest, Dispute]),
    AuthModule,
    NotificationsModule
  ],
  controllers: [DisputesController],
  providers: [DisputesService]
})
export class DisputesModule {}
