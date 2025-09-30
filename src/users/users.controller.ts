import { Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'Fetch user on the system with :userId' })
    @Get(':userId')
    @HttpCode(HttpStatus.OK)
    getProfile(@Param('userId') userId: string){
        return this.usersService.findUser(userId);
    }

    @ApiOperation({ summary: `Fetch processors on the system` })
    @Get('processor')
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
    @Get('farmer')
    @HttpCode(HttpStatus.OK)
    async findFarmers(
        @CurrentUser() currentUser: any,
        @Query('search') search?: string,
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber?: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    ) {
        return this.usersService.findFarmers(currentUser, search, pageNumber, pageSize);
    }
}
