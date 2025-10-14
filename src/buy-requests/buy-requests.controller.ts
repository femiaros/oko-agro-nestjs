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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BuyRequestCreateResponseDto, BuyRequestDeleteResponseDto, 
    BuyRequestGeneralListResponseDto, BuyRequestListResponseDto, 
    BuyRequestUpdateResponseDto, BuyRequestUpdateStatusResponseDto,
    BuyRequestFindResponseDto, BuyRequestFindByUserIdResponseDto
} from './dtos/response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buy-requests')
export class BuyRequestsController {
    constructor(private readonly buyRequestsService: BuyRequestsService) {}

    // 🔹 Create a new buy request (processors only)
    @ApiOperation({ summary: 'Create a new buy request (processors only)' })
    @ApiResponse({ status: 201, description: "Successfully created buyRequest", type: BuyRequestCreateResponseDto })
    @Post('create')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateBuyRequestDto, @CurrentUser() buyer: User, ) {
        return this.buyRequestsService.create(dto, buyer);
    }

    // 🔹 Update an existing buy request (processors only, their own request)
    @ApiOperation({ summary: 'Update an existing buy request (processors only, their own request)' })
    @ApiResponse({ status: 200, description: "Successfully updated buy request", type: BuyRequestUpdateResponseDto })
    @Put('update')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateBuyRequest(@Body() dto: UpdateBuyRequestDto, @CurrentUser() currentUser: User ) {
        return this.buyRequestsService.updateBuyRequest(dto, currentUser);
    }

    // 🔹 Update status (farmers only)
    @ApiOperation({ summary: 'Update buy request status (farmers only)' })
    @ApiResponse({ status: 200, description: "Successfully updated buy request status", type: BuyRequestUpdateStatusResponseDto })
    @Put('update-status')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Body() dto: UpdateBuyRequestStatusDto, @CurrentUser() currentUser: User) {
        return this.buyRequestsService.updateStatus(dto, currentUser);
    }

    // 🔹 Fetch all general requests (visible to farmers, returning pending requests - not older than 1 week)
    @ApiOperation({ summary: 'Fetch all general requests (visible to farmers only). Route returns pending requests, not older than 1 week' })
    @ApiResponse({ status: 200, description: "Successfully fetched general buy request", type: BuyRequestGeneralListResponseDto })
    @Get('general')
    @Roles(UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async findGeneralRequests() {
        return this.buyRequestsService.findGeneralRequests();
    }

    // 🔹 Fetch requests linked to current user (farmer → seller / processor → buyer)
    @ApiOperation({ summary: 'Fetch requests linked to current user: (farmer → seller / processor → buyer) both can access' })
    @ApiResponse({ status: 200, description: "Successfully fetched buy request", type: BuyRequestListResponseDto })
    @ApiQuery({ name: 'status', required: false, type: String, description: `Search by buy request's status field` })
    @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size (default: 20)' })
    @Get('my-requests')
    @HttpCode(HttpStatus.OK)
    async findMyBuyRequests(
        @CurrentUser() currentUser: User,
        @Query('status') status?: BuyRequestStatus,
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber?: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    ) {
        return this.buyRequestsService.findMyBuyRequests(
            currentUser,
            status,
            pageNumber,
            pageSize,
        );
    }

    @ApiOperation({ summary: 'Fetch buyRequest with :buyRequestId' })
    @ApiResponse({ status: 200, description: "Successfully fetched buyRequest", type: BuyRequestFindResponseDto })
    @Get(':buyRequestId')
    @HttpCode(HttpStatus.OK)
    async findBuyRequest(@Param('buyRequestId') buyRequestId: string) {
        return this.buyRequestsService.findBuyRequest(buyRequestId);
    }

    @ApiOperation({ summary: `Fetch a user's list buyRequests with :userId` })
    @ApiResponse({ status: 200, description: "Successfully fetched user's buyRequests", type: BuyRequestFindByUserIdResponseDto })
    @Get('user/:userId')
    @Roles(UserRole.PROCESSOR, UserRole.FARMER)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async findUserBuyRequests(@Param('userId') userId: string) {
        return this.buyRequestsService.findUserBuyRequests(userId);
    }

    // 🔹 Delete a request (soft delete, processors only)
    @ApiOperation({ summary: 'Delete a request (processors only)' })
    @ApiResponse({ status: 200, description: "Successfully deleted buy request", type: BuyRequestDeleteResponseDto })
    @Delete(':buyRequestId')
    @Roles(UserRole.PROCESSOR)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async deleteRequest( @Param('buyRequestId') buyRequestId: string, @CurrentUser() currentUser: User ) {
        return this.buyRequestsService.deleteRequest(buyRequestId, currentUser);
    }
}
