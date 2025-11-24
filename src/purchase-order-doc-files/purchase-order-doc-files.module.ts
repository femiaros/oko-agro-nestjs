import { Module } from '@nestjs/common';
import { PurchaseOrderDocFilesService } from './purchase-order-doc-files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderDocFile } from './entities/purchase-order-doc-file.entity';
import { CloudinaryModule } from 'src/files/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrderDocFile]),
    CloudinaryModule
  ],
  providers: [PurchaseOrderDocFilesService],
  exports: [PurchaseOrderDocFilesService]
})
export class PurchaseOrderDocFilesModule {}