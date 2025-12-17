import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsController } from './events.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Crop } from 'src/crops/entities/crop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event,Crop]),
    AuthModule
  ],
  providers: [EventsService],
  exports: [EventsService],
  controllers: [EventsController]
})
export class EventsModule {}
