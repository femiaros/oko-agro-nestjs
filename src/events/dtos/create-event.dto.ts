import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinDate } from 'class-validator';
import { EventReferenceType } from '../entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ example: 'Half year harvest', description: 'Name of event' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Event ABC', description: 'Short description of event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: EventReferenceType, example: EventReferenceType.CUSTOM, description: 'Event Type' })
  @IsEnum(EventReferenceType)
  referenceType: EventReferenceType;

  @ApiProperty({ example: 'q123-456-789', description: 'Reference ID (optional): if referenceType is custom, not need for a ReferenceId', required: false })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ example: '2025-10-01', description: 'EventDate (YYYY-MM-DD)' })
  @IsDateString()
  @Type(() => Date)
  @MinDate(() => new Date(), { message: 'eventDate must be a future date' })
  eventDate: Date;
}