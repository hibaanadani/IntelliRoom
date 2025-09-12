// src/ai-agent/dto/ai-agent.dto.ts

import {
  IsString,
  IsObject,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FrontendBookingDto {
  @IsString()
  title: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetTimesDto {
  @IsDateString()
  date: string;
}
