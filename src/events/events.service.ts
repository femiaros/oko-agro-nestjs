import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    ) {}

    async createEvent(dto: CreateEventDto & { owner: User; product?: Product }): Promise<any> {
        try {
            const event = this.eventsRepository.create({
                ...dto,
                owner: dto.owner,
                product: dto.product ?? null,
            });

            const savedEvent = await this.eventsRepository.save(event);
            
            return {
                statusCode: 201,
                message: 'Event created successfully',
                data: savedEvent,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async updateEvent(dto: UpdateEventDto, currentUser: User): Promise<any> {
        try {
            const event = await this.eventsRepository.findOne({ 
                where: { 
                    id: dto.eventId, 
                    // owner: { id: user.id },
                    isDeleted: false
                }
            });

            if (!event) throw new NotFoundException('Event not found or has been deleted');

            if (!event.owner || event.owner.id !== currentUser.id) {
                throw new ForbiddenException('This user is not authorized to update this event');
            }

            for (const [key, value] of Object.entries(dto)) {
                if (value !== undefined && value !== null) {
                    (event as any)[key] = value;
                }
            }

            const updatedEvent = await this.eventsRepository.save(event);

            return {
                statusCode: 200,
                message: 'Event updated successfully',
                data: updatedEvent,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async findEvent(eventId: string): Promise<any> {
        try {
            const event = await this.eventsRepository.findOne({
                where: {
                    id: eventId,
                    isDeleted: false,
                },
                relations: ['owner', 'product'],
            });

            if (!event) {
                throw new NotFoundException(`Event not found or has been deleted`);
            }

            return {
                statusCode: 200,
                message: 'Event fetched successfully',
                data: event,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async findUserEvents(userId: string): Promise<any> {
        try {
            const events = await this.eventsRepository.find({
                where: {
                    owner: { id: userId },
                    isDeleted: false, // exclude soft-deleted
                },
                relations: ['owner', 'product'],
                order: { eventDate: 'ASC' },
            });

            return {
                statusCode: 200,
                message: 'User events fetched successfully',
                data: events,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async removeEvent(id: string, user: User): Promise<any> {
        try{
            const event = await this.eventsRepository.findOne({ 
                where: { 
                    id, 
                    owner: { id: user.id },
                    isDeleted: false,
                } 
            });

            if (!event) throw new NotFoundException("Event not found or event don't belong to current user");

            event.isDeleted = true;
            await this.eventsRepository.save(event);


        }catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }
}