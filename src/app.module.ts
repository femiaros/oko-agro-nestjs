import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CropsModule } from './crops/crops.module';
import { FilesModule } from './files/files.module';
import ormconfig from './config/ormconfig';
import { MailerModule } from './mailer/mailer.module';
import { CertificationsModule } from './certifications/certifications.module';
import { QualityStandardsModule } from './quality-standards/quality-standards.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // makes ConfigService available everywhere
    TypeOrmModule.forRoot(ormconfig),
    UsersModule, AuthModule, CropsModule, FilesModule, MailerModule, CertificationsModule, QualityStandardsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
