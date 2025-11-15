import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from 'src/users/entities/user.entity';
import { AdminService } from './admin.service';
import { DashboardOverviewResponseDto } from './dtos/response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @ApiOperation({ summary: 'Get admin dashboard overview stats' })
    @ApiResponse({ status: 200, description: "Dashboard stats fetched successfully", type: DashboardOverviewResponseDto })
    @Get('dashboard/overview')
    @HttpCode(HttpStatus.OK)
    async getDashboardOverview() {
        return this.adminService.getDashboardOverview();
    }
}
