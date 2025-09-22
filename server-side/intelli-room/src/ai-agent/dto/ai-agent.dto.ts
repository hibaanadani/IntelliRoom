import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FrontendBookingDto {
  @ApiProperty({
    example: 'Client Consultation',
    description: 'The title of the booking.',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'jane.doe@example.com',
    description: 'The email of the person making the booking.',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'The full name of the person making the booking.',
  })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({
    example: '2025-09-22T10:00:00Z',
    description: 'The start time of the booking in ISO 8601 format.',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2025-09-22T11:00:00Z',
    description: 'The end time of the booking in ISO 8601 format.',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    example: ['john.smith@example.com', 'alex.williams@example.com'],
    description: 'An array of email addresses for participants. Optional.',
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  participants?: string[];

  @ApiProperty({
    example: 'Discussion about project requirements and timeline.',
    description: 'Additional notes for the booking. Optional.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetTimesDto {
  @ApiProperty({
    example: '2025-09-22',
    description: 'The date for which to retrieve available times.',
  })
  @IsString()
  @IsDateString()
  date: string;
}
