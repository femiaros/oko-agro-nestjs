import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinDate } from 'class-validator';
import { CropQuantityUnit, EventReferenceType } from '../entities/event.entity';
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

  // @ApiProperty({ example: '2025-10-01', description: 'EventDate (YYYY-MM-DD)' })
  // @IsDateString()
  // @Type(() => Date)
  // @MinDate(() => new Date(), { message: 'eventDate must be a future date' })
  // eventDate: Date;

  // @ApiProperty({ example: '2025-10-08T19:04:46.650Z', description: 'EventDate (YYYY-MM-DD)' })
  // @IsDateString()
  // @MinDate(() => new Date(), { message: 'eventDate must be a future date' })
  // eventDate: Date;

  @ApiProperty({ example: '2025-10-01', description: 'EventDate (YYYY-MM-DD)' })
  @IsDateString()
  eventDate: Date;

  // Harvest-related fields

  @ApiProperty({ example: true, description:'Indicates whether this event is a harvest event', default: false })
  @IsBoolean()
  @IsOptional()
  isHarvestEvent?: boolean = false;

  @ApiProperty({ example: 'uuid-of-crop', description: 'Crop ID (required when isHarvestEvent is true and referenceType is CUSTOM)', required: false})
  @IsUUID()
  @IsOptional()
  cropId?: string;

  @ApiProperty({ example: '200', description: 'Quantity of crop harvested (required for custom harvest events)', required: false})
  @IsString()
  @IsOptional()
  cropQuantity?: string;

  @ApiProperty({
    enum: CropQuantityUnit,
    example: CropQuantityUnit.TONNE,
    description: 'Unit of crop quantity (required for custom harvest events)',
    required: false
  })
  @IsEnum(CropQuantityUnit)
  @IsOptional()
  cropQuantityUnit?: CropQuantityUnit;
}