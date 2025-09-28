import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EventReferenceType } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(EventReferenceType)
  referenceType: EventReferenceType;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsDateString()
  eventDate: Date;
}