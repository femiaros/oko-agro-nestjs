import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { BuyRequestsScheduler } from './buy-requests.scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enables scheduling globally - This boots up the global scheduler engine
    TypeOrmModule.forFeature([BuyRequest]), // For repository access
  ],
  providers: [BuyRequestsScheduler],
})
export class SchedulersModule {}