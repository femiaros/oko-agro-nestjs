import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { CloudinaryService } from 'src/files/cloudinary/cloudinary.service';
import { Repository } from 'typeorm';
import { FarmerProductPhotoFile } from './entities/farmer-product-photo-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { normalizeBase64 } from 'src/common/utils/base64.util';

@Injectable()
export class FarmerProductPhotoFilesService {
    constructor(
        @InjectRepository(FarmerProductPhotoFile) private readonly fileRepository: Repository<FarmerProductPhotoFile>,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async uploadFile(base64: string, description: string, product: Product): Promise<any> {
        try{
            // Normalize base64 (adds prefix if missing, detects type by magic number)
            const { base64: normalizedBase64, mimeType } = normalizeBase64(base64);

            const fileName = `${product.name}_${description}_${Math.floor(
                1000 + Math.random() * 9000,
            )}`;

            // Calculate size in KB (strip prefix)
            const pureBase64 = normalizedBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
            const padding = (pureBase64.match(/=*$/) || [''])[0].length;
            const sizeInBytes = (pureBase64.length * 3) / 4 - padding;
            const sizeInKB = sizeInBytes / 1024;

            console.log("Upload size (KB):", sizeInKB);
            console.log("Final base64 header:", normalizedBase64.substring(0, 30));

            const result = await this.cloudinaryService.uploadFile(
                normalizedBase64,
                'okoAgroFarmerProductPhotos',
                fileName,
            );

            const file = this.fileRepository.create({
                name: fileName,
                description,
                mimeType,
                size: sizeInKB.toString(),
                url: result.secure_url, 
                publicId: result.public_id, 
                product,
            });

            return await this.fileRepository.save(file);

        }catch(error){
            console.error("Cloudinary upload error:", error);
            handleServiceError(error, 'FarmerProductPhotoFile upload failed');
            // throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAllFile(): Promise<FarmerProductPhotoFile[]>{
        return this.fileRepository.find({relations: ['product'], order: {createdAt: 'DESC'}})
    }

    async removeFile(id: string): Promise<any>{
        try {
            const existingFile = await this.fileRepository.findOne({
                where: [{ id }, { publicId: id }],
            });

            if (!existingFile) {
                throw new NotFoundException(`FarmerProductPhotoFile with ID or PublicId ${id} not found.`);
            }

            if (!existingFile.publicId) {
                throw new BadRequestException(
                    `File record found, but it does not have a Cloudinary reference (publicId).`
                );
            }

            // ✅ Delete from Cloudinary
            await this.cloudinaryService.deleteFile(existingFile.publicId);

            // ✅ Delete from DB
            await this.fileRepository.remove(existingFile);

            return {
                statusCode: 200,
                message: 'Farmer product photo file deleted successfully!',
                data: { id: existingFile.id, publicId: existingFile.publicId },
            };
        } catch (error) {
            handleServiceError(error, 'Failed to delete farmer product photo file');
        }
    }

}
