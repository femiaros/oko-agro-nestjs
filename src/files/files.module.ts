import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    CloudinaryModule
  ],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
