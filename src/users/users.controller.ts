import { Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: `Fetch processors on the system` })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by farmName, state, country, or farmAddress' })
    @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size (default: 20)' })
    @Get('processors')
    @HttpCode(HttpStatus.OK)
    async findProcessors(
        @CurrentUser() currentUser: any,
        @Query('search') search?: string,
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber?: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    ) {
        return this.usersService.findProcessors(currentUser, search, pageNumber, pageSize);
    }

    @ApiOperation({ summary: `Fetch farmers on the system` })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by farmName, state, country, or farmAddress' })
    @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size (default: 20)' })
    @Get('farmers')
    @HttpCode(HttpStatus.OK)
    async findFarmers(
        @CurrentUser() currentUser: any,
        @Query('search') search?: string,
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber?: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    ) {
        return this.usersService.findFarmers(currentUser, search, pageNumber, pageSize);
    }

    @ApiOperation({ summary: 'Fetch user on the system with :userId' })
    @Get(':userId')
    @HttpCode(HttpStatus.OK)
    getProfile(@Param('userId') userId: string){
        return this.usersService.findUser(userId);
    }
}
