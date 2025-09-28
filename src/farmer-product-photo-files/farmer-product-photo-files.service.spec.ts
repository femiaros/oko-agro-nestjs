import { Test, TestingModule } from '@nestjs/testing';
import { FarmerProductPhotoFilesService } from './farmer-product-photo-files.service';

describe('FarmerProductPhotoFilesService', () => {
  let service: FarmerProductPhotoFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmerProductPhotoFilesService],
    }).compile();

    service = module.get<FarmerProductPhotoFilesService>(FarmerProductPhotoFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
