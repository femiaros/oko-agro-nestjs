import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderDocFilesService } from './purchase-order-doc-files.service';

describe('PurchaseOrderDocFilesService', () => {
  let service: PurchaseOrderDocFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseOrderDocFilesService],
    }).compile();

    service = module.get<PurchaseOrderDocFilesService>(PurchaseOrderDocFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
