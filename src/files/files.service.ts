import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { User } from '../users/entities/user.entity';
import { normalizeBase64 } from 'src/common/utils/base64.util';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        private readonly cloudinaryService: CloudinaryService
    ) {}

    async uploadFileDropped(base64: string, description: string, owner: User): Promise<File> {
        try{
            // Normalize base64 (adds prefix if missing, detects type by magic number)
            const { base64: normalizedBase64, mimeType } = normalizeBase64(base64);

            const fileName = `${owner.firstName}_${owner.lastName}_${description}_${Math.floor(
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
                'okoAgro',
                fileName,
            );

            const file = this.fileRepository.create({
                name: fileName,
                description,
                mimeType,
                size: sizeInKB.toString(),
                url: result.secure_url, 
                publicId: result.public_id, 
                owner,
            });

            return await this.fileRepository.save(file);

        }catch(error){
            console.error("Cloudinary upload error:", error);
            if (error instanceof HttpException) throw error; // Re-throw our custom exception
            // Handle other errors
            throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFile(base64: string, description: string, owner: User): Promise<File> {
        try{
            // Check if a file already exists
            const existingFile = await this.fileRepository.findOne({
                where: { owner: { id: owner.id }, description }
            });

            if (existingFile) {
                await this.removeFile(existingFile.id);
            }

            // Continue with upload
            const { base64: normalizedBase64, mimeType } = normalizeBase64(base64);

            const fileName = `${owner.firstName}_${owner.lastName}_${description}_${Math.floor(
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
                'okoAgro',
                fileName,
            );

            const file = this.fileRepository.create({
                name: fileName,
                description,
                mimeType,
                size: sizeInKB.toString(),
                url: result.secure_url, 
                publicId: result.public_id, 
                owner,
            });

            return await this.fileRepository.save(file);

        }catch(error){
            console.error("Cloudinary upload error:", error);
            if (error instanceof HttpException) throw error; // Re-throw our custom exception
            // Handle other errors
            throw new HttpException('File upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAllFile(): Promise<File[]>{
        return this.fileRepository.find({relations: ['owner'], order: {createdAt: 'DESC'}})
    }

    async removeFile(id: string): Promise<void>{
        const existingFile = await this.fileRepository.findOne({ where: {id} })

        if(!existingFile) throw new NotFoundException(`File with ID ${id} not found.`)

        // Delete from cloudinary
        await this.cloudinaryService.deleteFile(existingFile.publicId)

        // Delete from DB
        await this.fileRepository.remove(existingFile)
    }

}