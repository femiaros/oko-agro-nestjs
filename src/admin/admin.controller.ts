import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AdminService } from './admin.service';
import { 
    CreateAdminResponseDto, DashboardOverviewResponseDto, 
    DeleteAdminResponseDto, UpdateAdminPwdResponseDto, UpdateUserResponseDto 
} from './dtos/response.dto';
import { CreateAdminUserDto } from './dtos/create-admin-user.dto';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';
import { UpdateAdminPasswordDto } from './dtos/update-admin-password.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('dashboard/overview')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get admin dashboard overview stats' })
    @ApiResponse({ status: 200, description: "Dashboard stats fetched successfully", type: DashboardOverviewResponseDto })
    @HttpCode(HttpStatus.OK)
    async getDashboardOverview() {
        return this.adminService.getDashboardOverview();
    }

    @Post('create-admin')
    @Roles(UserRole.SUPER_ADMIN)   // Only super_admin can access
    @ApiOperation({ summary: "Create a new Admin user (Only super admin)" })
    @ApiResponse({ status: 201, description: "Admin user created successfully", type: CreateAdminResponseDto})
    async createAdmin(@Body() dto: CreateAdminUserDto,) {
        return this.adminService.createAdmin(dto);
    }

    @Patch('update-status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: "Enable or disable a user account" })
    @ApiResponse({ status: 200, description: "User status updated", type: UpdateUserResponseDto})
    async updateUserStatus(@Body() dto: UpdateUserStatusDto,
    ) {
        return this.adminService.updateUserStatus(dto);
    }

    @Post('/update-admin-password')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: "Update admin password" })
    @ApiResponse({ status: 200, description: "Password updated successfully", type: UpdateAdminPwdResponseDto})
    async updateAdminPassword(@CurrentUser() currentUser: User, @Body() dto: UpdateAdminPasswordDto
    ) {
        return this.adminService.updateAdminPassword(dto, currentUser);
    }


    @Delete(':userId')
    @Roles(UserRole.SUPER_ADMIN) // Only super_admin can access
    @ApiOperation({ summary: "Delete an admin user (SUPER ADMIN only)" })
    @ApiResponse({ status: 200, description: "Admin deleted", type: DeleteAdminResponseDto})
    async deleteAdmin(@Param('userId') userId: string) {
        return this.adminService.deleteAdmin(userId);
    }
}
