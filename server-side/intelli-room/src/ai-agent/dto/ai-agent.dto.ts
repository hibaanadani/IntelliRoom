import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class FrontendBookingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
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
  @IsString()
  @IsDateString()
  date: string;
}
