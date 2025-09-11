import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { QualityStandardsService } from './quality-standards.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { QualityStandard } from './entities/quality-standard.entity';
import { CreateQualityStandardDto } from './dtos/create-quality-standard.dto';

@Controller('quality-standards')
export class QualityStandardsController {
    constructor(private readonly certificationsService: QualityStandardsService) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async create(@Body() createQualityStandardDto: CreateQualityStandardDto): Promise<QualityStandard> {
        return this.certificationsService.create(createQualityStandardDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<QualityStandard[]> {
        return this.certificationsService.findAll();
    }
}
