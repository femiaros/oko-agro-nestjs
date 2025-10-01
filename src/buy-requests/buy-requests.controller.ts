import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BuyRequestsService } from './buy-requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { User, UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { CreateBuyRequestDto } from './dtos/create-buy-request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateBuyRequestDto } from './dtos/update-buy-request.dto';
import { UpdateBuyRequestStatusDto } from './dtos/update-buy-request-status.dto';
import { BuyRequestStatus } from './entities/buy-request.entity';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buy-requests')
export class BuyRequestsController {
    constructor(private readonly buyRequestsService: BuyRequestsService) {}

    // 🔹 Create a new buy request (processors only)
    @ApiOperation({ summary: 'Create a new buy request (processors only)' })
    @Post('create')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateBuyRequestDto, @CurrentUser() buyer: User, ) {
        return this.buyRequestsService.create(dto, buyer);
    }

    // 🔹 Update an existing buy request (processors only, their own request)
    @ApiOperation({ summary: 'Update an existing buy request (processors only, their own request)' })
    @Put('update')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateBuyRequest(@Body() dto: UpdateBuyRequestDto, @CurrentUser() currentUser: User ) {
        return this.buyRequestsService.updateBuyRequest(dto, currentUser);
    }

    // 🔹 Update status (farmers only)
    @ApiOperation({ summary: 'Update buy request status (farmers only)' })
    @Put('update-status')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Body() dto: UpdateBuyRequestStatusDto, @CurrentUser() currentUser: User) {
        return this.buyRequestsService.updateStatus(dto, currentUser);
    }

    // 🔹 Fetch all general requests (visible to farmers, returning pending requests - not older than 1 week)
    @ApiOperation({ summary: 'Fetch all general requests (visible to farmers only). Route returns pending requests, not older than 1 week' })
    @Get('general')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async findGeneralRequests() {
        return this.buyRequestsService.findGeneralRequests();
    }

    // 🔹 Fetch requests linked to current user (farmer → seller / processor → buyer)
    @ApiOperation({ summary: 'Fetch requests linked to current user: (farmer → seller / processor → buyer) both can access' })
    @ApiQuery({ name: 'status', required: false, type: String, description: `Search by buy request's status field` })
    @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size (default: 20)' })
    @Get('my-requests')
    @HttpCode(HttpStatus.OK)
    async findUserBuyRequests(
        @CurrentUser() currentUser: User,
        @Query('status') status?: BuyRequestStatus,
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber?: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    ) {
        return this.buyRequestsService.findUserBuyRequests(
            currentUser,
            status,
            pageNumber,
            pageSize,
        );
    }

    // 🔹 Delete a request (soft delete, processors only)
    @ApiOperation({ summary: 'Delete a request (processors only)' })
    @Delete(':buyRequestId')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async deleteRequest( @Param('buyRequestId') buyRequestId: string, @CurrentUser() currentUser: User ) {
        return this.buyRequestsService.deleteRequest(buyRequestId, currentUser);
    }
}
