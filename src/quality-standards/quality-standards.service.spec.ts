import { Test, TestingModule } from '@nestjs/testing';
import { QualityStandardsService } from './quality-standards.service';

describe('QualityStandardsService', () => {
  let service: QualityStandardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QualityStandardsService],
    }).compile();

    service = module.get<QualityStandardsService>(QualityStandardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
