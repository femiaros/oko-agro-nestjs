import { Test, TestingModule } from '@nestjs/testing';
import { ProductInventoriesController } from './product-inventories.controller';

describe('ProductInventoriesController', () => {
  let controller: ProductInventoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductInventoriesController],
    }).compile();

    controller = module.get<ProductInventoriesController>(ProductInventoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
