import { Module } from '@nestjs/common';
import { QualityStandardsController } from './quality-standards.controller';
import { QualityStandardsService } from './quality-standards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { QualityStandard } from './entities/quality-standard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QualityStandard]),
    AuthModule
  ],
  controllers: [QualityStandardsController],
  providers: [QualityStandardsService]
})
export class QualityStandardsModule {}
