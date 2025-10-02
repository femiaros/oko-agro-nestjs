import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { User, UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateEventDto } from './dtos/update-event.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventCreateResponseDto, EventDeleteResponseDto, EventFindResponseDto, EventUpdateResponseDto, EventUserListResponseDto } from './dtos/response.dto';

@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @ApiOperation({ summary: 'Create a new Event' })
    @ApiResponse({ status: 201, description: "Successfully created event", type: EventCreateResponseDto })
    @Post('create')
    // @Roles(UserRole.FARMER,UserRole.PROCESSOR)
    // @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async createEvent(@Body() dto: CreateEventDto, @CurrentUser() currentUser: User) {
        return this.eventsService.createEvent({ ...dto, owner: currentUser });
    }

    @ApiOperation({ summary: 'Update a Event (Only user who created the event can update)' })
    @ApiResponse({ status: 200, description: "Successfully updated event", type: EventUpdateResponseDto })
    @Patch('update')
    @HttpCode(HttpStatus.OK)
    async updateProduct(@Body() dto: UpdateEventDto, @CurrentUser() currentUser: User) {
        return this.eventsService.updateEvent(dto, currentUser);
    }

    @ApiOperation({ summary: 'Fetch event with :eventId' })
    @ApiResponse({ status: 200, description: "Successfully fetched event", type: EventFindResponseDto })
    @Get(':eventId')
    @HttpCode(HttpStatus.OK)
    async findEvent(@Param('eventId') eventId: string) {
        return this.eventsService.findEvent(eventId);
    }

    @ApiOperation({ summary: `Fetch a user's list of events with :userId` })
    @ApiResponse({ status: 200, description: "Successfully fetched user's events", type: EventUserListResponseDto })
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async findUserEvents(@Param('userId') userId: string) {
        return this.eventsService.findUserEvents(userId);
    }

    @ApiOperation({ summary: `Delete event (Only the owner can deleted)` })
    @ApiResponse({ status: 200, description: "Successfully deleted event", type: EventDeleteResponseDto })
    @Delete(':eventId')
    @HttpCode(HttpStatus.OK)
    async removeEvent(@Param('eventId') eventId: string, @CurrentUser() currentUser: User) {
        return this.eventsService.removeEvent(eventId, currentUser);
    }

}
