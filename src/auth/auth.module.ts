import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { FilesModule } from 'src/files/files.module';
import { Crop } from '../crops/entities/crop.entity';
import { Certification } from '../certifications/entities/certification.entity';
import { QualityStandard } from '../quality-standards/entities/quality-standard.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from 'src/mailer/mailer.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles-guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Crop, Certification, QualityStandard]), // This makes user repository available for injection
    PassportModule, // PassportModule - Passport Service will be used in auth service
    JwtModule.register({}), // Configure JWT
    FilesModule,
    MailerModule
  ], 
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard]
})
export class AuthModule {}
