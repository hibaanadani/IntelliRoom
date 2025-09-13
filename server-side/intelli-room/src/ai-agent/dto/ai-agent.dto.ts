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
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
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
