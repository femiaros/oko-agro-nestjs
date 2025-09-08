import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CropsService } from './crops.service';
import { Crop } from './entities/crop.entity';
import { CreateCropDto } from './dtos/create-crop.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';

@Controller('crops')
export class CropsController {
    constructor(private readonly cropsService: CropsService) {}

    @Post('create')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async create(@Body() createCropDto: CreateCropDto): Promise<Crop> {
        return this.cropsService.create(createCropDto);
    }

    @Get()
    async findAll(): Promise<Crop[]> {
        return this.cropsService.findAll();
    }
}
