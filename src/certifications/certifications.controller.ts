import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { CertificationsService } from './certifications.service';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dtos/create-certification.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('certifications')
export class CertificationsController {
    constructor(private readonly certificationsService: CertificationsService) {}

    @Post('create')
    @Roles(UserRole.ADMIN,UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCertificationDto: CreateCertificationDto): Promise<Certification> {
        return this.certificationsService.create(createCertificationDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FARMER, UserRole.PROCESSOR)
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Certification[]> {
        return this.certificationsService.findAll();
    }
}
