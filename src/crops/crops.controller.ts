import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CropsService } from './crops.service';
import { Crop } from './entities/crop.entity';
import { CreateCropDto } from './dtos/create-crop.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crops')
export class CropsController {
    constructor(private readonly cropsService: CropsService) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCropDto: CreateCropDto): Promise<Crop> {
        return this.cropsService.create(createCropDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Crop[]> {
        return this.cropsService.findAll();
    }
}
