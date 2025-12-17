import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventReferenceType, EventStatus } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Crop } from 'src/crops/entities/crop.entity';
import { GetEventsQueryDto } from './dtos/get-events-query.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
        @InjectRepository(Crop) private readonly cropsRepository: Repository<Crop>,
    ) {}

    async createEvent( dto: CreateEventDto & { owner: User; product?: Product }): Promise<any> {
        try {
            // Date validation
            const now = new Date();
            const eventDate = new Date(dto.eventDate);

            if (eventDate <= now) {
            throw new BadRequestException('eventDate must be a future date');
            }

            // Normalize dates (ignore time)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const eventDay = new Date(eventDate);
            eventDay.setHours(0, 0, 0, 0);

            let status: EventStatus;

            if (eventDay.getTime() === today.getTime()) {
                status = EventStatus.TODAY;
            } else if (eventDay.getTime() > today.getTime()) {
                status = EventStatus.UPCOMING;
            } else {
                throw new BadRequestException('eventDate must be today or a future date');
            }

            // Harvest logic

            const {
                cropId,
                cropQuantity,
                cropQuantityUnit,
                isHarvestEvent,
                referenceType,
            } = dto;

            const anyCropFieldProvided =
                !!cropId || !!cropQuantity || !!cropQuantityUnit;

            // If any crop-related field is provided → it must be a harvest event
            if (anyCropFieldProvided) {
                if (!isHarvestEvent) {
                    throw new BadRequestException(
                        'isHarvestEvent must be true when crop details are provided',
                    );
                }

                if (!cropId || !cropQuantity || !cropQuantityUnit) {
                    throw new BadRequestException(
                        'cropId, cropQuantity, and cropQuantityUnit are all required for a harvest event',
                    );
                }

                // Only CUSTOM events can define crop-based harvests
                if (referenceType !== EventReferenceType.CUSTOM) {
                    throw new BadRequestException(
                        'Only custom events can define crop-based harvest events',
                    );
                }
            }

            // Attach crop if provided
            let crop: Crop | null = null;

            if (cropId) {
                crop = await this.cropsRepository.findOne({
                    where: { id: cropId },
                });

                if (!crop) {
                    throw new BadRequestException('Invalid cropId');
                }
            }

            // Create Event
            const event = this.eventsRepository.create({
                name: dto.name,
                description: dto.description,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId ?? null,
                eventDate,
                status,
                owner: dto.owner,
                product: dto.product ?? null,

                // harvest fields
                isHarvestEvent: isHarvestEvent ?? false,
                crop,
                cropQuantity: cropQuantity ?? null,
                cropQuantityUnit: cropQuantityUnit ?? null,
            });

            const savedEvent = await this.eventsRepository.save(event);

            return {
                statusCode: 201,
                message: 'Event created successfully',
                data: savedEvent,
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while creating event');
        }
    }

    async updateEvent(dto: UpdateEventDto, currentUser: User): Promise<any> {
        try {
            // Check if eventDate is in the past
            const today = new Date();
            if (dto.eventDate && new Date(dto.eventDate) <= today) {
                throw new BadRequestException('eventDate must be a future date');
            }

            const event = await this.eventsRepository.findOne({ 
                where: { 
                    id: dto.eventId, 
                    // owner: { id: user.id },
                    isDeleted: false
                },
                relations: ['owner', 'product']
            });

            if (!event) throw new NotFoundException('Event not found or has been deleted');

            if (!event.owner || event.owner.id !== currentUser.id) {
                throw new ForbiddenException('This user is not authorized to update this event');
            }

            for (const [key, value] of Object.entries(dto)) {
                if (key === 'eventId') continue; // skip eventId

                if (value !== undefined && value !== null) {
                    (event as any)[key] = value;

                    // ✅ If updating eventDate, also update status
                    if (key === 'eventDate') {
                        const newDate = new Date(value as string);
                        // event.eventDate = newDate;

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const eventDay = new Date(newDate);
                        eventDay.setHours(0, 0, 0, 0);

                        if (eventDay.getTime() === today.getTime()) {
                            event.status = EventStatus.TODAY;
                        } else if (eventDay.getTime() > today.getTime()) {
                            event.status = EventStatus.UPCOMING;
                        } else {
                            throw new BadRequestException('eventDate must be today or a future date');
                        }
                    }
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
                relations: ['crop', 'owner', 'product'],
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

    async removeEvent(id: string, currentUser: User): Promise<any> {
        try{
            const event = await this.eventsRepository.findOne({ 
                where: { 
                    id, 
                    isDeleted: false,
                },
                relations: ['owner', 'product']
            });

            if (!event) throw new NotFoundException("Event not found");

            if (!event.owner || event.owner.id !== currentUser.id) {
                throw new ForbiddenException('This user is not authorized to deleted this event');
            }

            event.isDeleted = true;
            await this.eventsRepository.save(event);

            return {
                statusCode: 200,
                message: 'Event deleted successfully',
            };

        }catch (error) {
            handleServiceError(error, 'An error occurred');
        }
    }

    async getAllEvents(query: GetEventsQueryDto): Promise<any> {
        const {
            pageNumber = 1,
            pageSize,
            isHarvestEvent,
        } = query;

        try {
            const qb = this.eventsRepository
                .createQueryBuilder('event')
                .leftJoinAndSelect('event.owner', 'owner')
                .leftJoinAndSelect('event.crop', 'crop')
                .leftJoinAndSelect('event.product', 'product')
                .where('event.isDeleted = false')
                .orderBy('event.createdAt', 'DESC');

            if (isHarvestEvent) {
                qb.andWhere('event.isHarvestEvent = :isHarvestEvent', {
                    isHarvestEvent,
                });
            }

            // Count total before pagination
            const totalRecord = await qb.getCount();

            // Apply pagination ONLY if pageSize is provided
            if (pageSize) {
                qb.skip((pageNumber - 1) * pageSize).take(pageSize);
            }

            const items = await qb.getMany();

            return {
                statusCode: 200,
                message: 'Events retrieved successfully',
                data: {
                    items: instanceToPlain(items),
                    totalRecord,
                    pageNumber,
                    pageSize: pageSize ?? totalRecord,
                },
            };
        } catch (error) {
            handleServiceError(error, 'An error occurred while retrieving events');
        }
    }

}