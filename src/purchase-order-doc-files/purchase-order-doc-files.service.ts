import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseOrderDocFile } from './entities/purchase-order-doc-file.entity';
import { CloudinaryService } from 'src/files/cloudinary/cloudinary.service';
import { Repository } from 'typeorm';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { BuyRequest } from 'src/buy-requests/entities/buy-request.entity';
import { normalizeBase64 } from 'src/common/utils/base64.util';

@Injectable()
export class PurchaseOrderDocFilesService {
    constructor(
        @InjectRepository(PurchaseOrderDocFile) private readonly fileRepository: Repository<PurchaseOrderDocFile>,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async uploadFile(base64: string, description: string, buyRequest: BuyRequest): Promise<any> {
        try{
            // Normalize base64 (adds prefix if missing, detects type by magic number)
            const { base64: normalizedBase64, mimeType } = normalizeBase64(base64);

            const fileName = `${buyRequest.requestNumber}_${description}_${Math.floor(
                1000 + Math.random() * 9000,
            )}`;

            // Calculate size in KB (strip prefix)
            const pureBase64 = normalizedBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
            const padding = (pureBase64.match(/=*$/) || [''])[0].length;
            const sizeInBytes = (pureBase64.length * 3) / 4 - padding;
            const sizeInKB = sizeInBytes / 1024;

            const result = await this.cloudinaryService.uploadFile(
                normalizedBase64,
                'buyRequestPurchaseOrder',
                fileName,
            );

            const file = this.fileRepository.create({
                name: fileName,
                description,
                mimeType,
                size: sizeInKB.toString(),
                url: result.secure_url, 
                publicId: result.public_id, 
                buyRequest,
            });

            return await this.fileRepository.save(file);

        }catch(error){
            console.error("Cloudinary upload error:", error);
            handleServiceError(error, 'PurchaseOrderDocFile upload failed');
        }
    }

    async removeFile(id: string): Promise<any>{
        try {
            const existingFile = await this.fileRepository.findOne({
                where: [{ id }, { publicId: id }],
            });

            if (!existingFile) {
                throw new NotFoundException(`PurchaseOrderDocFile with ID or PublicId ${id} not found.`);
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
                message: 'Purchase order doc file deleted successfully!',
                data: { id: existingFile.id, publicId: existingFile.publicId },
            };
        } catch (error) {
            handleServiceError(error, 'Failed to delete PurchaseOrderDocFile');
        }
    }
}
