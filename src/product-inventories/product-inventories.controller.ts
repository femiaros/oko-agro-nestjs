import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductInventoriesService } from './product-inventories.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventories')
export class ProductInventoriesController {
    constructor(private readonly productInventoriesService: ProductInventoriesService) {}


}
