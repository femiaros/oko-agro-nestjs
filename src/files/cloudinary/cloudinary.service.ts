import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    constructor(@Inject('CLOUDINARY') private cloudinary: any) {}

    async uploadFile(base64: string, folder: string, filename: string): Promise<UploadApiResponse> {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const upload = this.cloudinary.uploader.upload_stream(
                { folder,  resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            const buffer = Buffer.from(base64.split(',')[1], 'base64');
            console.log("Cloudinary upload Buffer:", buffer);

            streamifier.createReadStream(buffer).pipe(upload);
            // upload.end(buffer);
        });
    }

    async deleteFile(publicId: string): Promise<any> {
        return this.cloudinary.uploader.destroy(publicId);
    }

}