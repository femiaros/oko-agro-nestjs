import { Module } from '@nestjs/common';
import { FarmerProductPhotoFilesService } from './farmer-product-photo-files.service';
import { CloudinaryModule } from 'src/files/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmerProductPhotoFile } from './entities/farmer-product-photo-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmerProductPhotoFile]),
    CloudinaryModule
  ],
  providers: [FarmerProductPhotoFilesService],
  exports: [FarmerProductPhotoFilesService]
})
export class FarmerProductPhotoFilesModule {}
