import { Module } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CertificationsController } from './certifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Certification } from './entities/certification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certification]),
    AuthModule
  ],
  providers: [CertificationsService],
  controllers: [CertificationsController]
})
export class CertificationsModule {}
