import { Test, TestingModule } from '@nestjs/testing';
import { QualityStandardsController } from './quality-standards.controller';

describe('QualityStandardsController', () => {
  let controller: QualityStandardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualityStandardsController],
    }).compile();

    controller = module.get<QualityStandardsController>(QualityStandardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
