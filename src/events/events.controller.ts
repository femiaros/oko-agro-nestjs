import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { User, UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateEventDto } from './dtos/update-event.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @ApiOperation({ summary: 'Create a new Event' })
    @Post('create')
    // @Roles(UserRole.FARMER,UserRole.PROCESSOR)
    // @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async createEvent(@Body() dto: CreateEventDto, @CurrentUser() currentUser: User) {
        return this.eventsService.createEvent({ ...dto, owner: currentUser });
    }

    @ApiOperation({ summary: 'Update a Event (Only user who created the event can update)' })
    @Patch('update')
    @HttpCode(HttpStatus.OK)
    async updateProduct(@Body() dto: UpdateEventDto, @CurrentUser() currentUser: User) {
        return this.eventsService.updateEvent(dto, currentUser);
    }

    @ApiOperation({ summary: 'Fetch event with :eventId' })
    @Get(':eventId')
    @HttpCode(HttpStatus.OK)
    async findEvent(@Param('eventId') eventId: string) {
        return this.eventsService.findEvent(eventId);
    }

    @ApiOperation({ summary: `Fetch a user's list of events with :userId` })
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async findUserEvents(@Param('userId') userId: string) {
        return this.eventsService.findUserEvents(userId);
    }

    @ApiOperation({ summary: `Delete event (Only the owner can deleted)` })
    @Delete(':eventId')
    @HttpCode(HttpStatus.OK)
    async removeEvent(@Param('eventId') eventId: string, @CurrentUser() currentUser: User) {
        return this.eventsService.removeEvent(eventId, currentUser);
    }

}
