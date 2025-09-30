import { Test, TestingModule } from '@nestjs/testing';
import { BuyRequestsController } from './buy-requests.controller';

describe('BuyRequestsController', () => {
  let controller: BuyRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyRequestsController],
    }).compile();

    controller = module.get<BuyRequestsController>(BuyRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
