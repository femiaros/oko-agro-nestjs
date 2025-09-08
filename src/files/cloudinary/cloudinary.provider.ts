import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

// console.log(`-------${process.env.CLOUDINARY_NAME}--------${process.env.CLOUDINARY_API_KEY}-------`);

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    console.log(`---11----${process.env.CLOUDINARY_NAME}--------${process.env.CLOUDINARY_API_KEY}-------`);
    console.log(`----22---${config.get<string>('CLOUDINARY_NAME')}--------${config.get<string>('CLOUDINARY_API_KEY')}-------`);

    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
    return cloudinary;
  },
};
