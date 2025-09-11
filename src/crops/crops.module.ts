import { Module } from '@nestjs/common';
import { CropsController } from './crops.controller';
import { CropsService } from './crops.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './entities/crop.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Crop]),
    AuthModule
  ],
  controllers: [CropsController],
  providers: [CropsService],
  exports: [CropsService]
})
export class CropsModule {}
