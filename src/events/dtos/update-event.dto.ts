import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto {
    @ApiProperty({ example: 'b123-456-789', description: 'ID of the event to update' })
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @ApiProperty({ example: 'Half year harvest', description: 'Name of event (optional)' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Event ABC', description: 'Short description of event (optional)' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '2025-10-01', description: 'EventDate (YYYY-MM-DD) (optional)' })
    @IsDateString()
    @IsOptional()
    eventDate?: Date;
}