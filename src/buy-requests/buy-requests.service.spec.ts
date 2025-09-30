import { Test, TestingModule } from '@nestjs/testing';
import { BuyRequestsService } from './buy-requests.service';

describe('BuyRequestsService', () => {
  let service: BuyRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuyRequestsService],
    }).compile();

    service = module.get<BuyRequestsService>(BuyRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
