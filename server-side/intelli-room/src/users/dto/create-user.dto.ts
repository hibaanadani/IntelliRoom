// DTO = Data Transfer Object
// Think of this as a "form" that defines what data we expect when creating a user
// It helps us validate the data before saving it to the database

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  Min,
} from 'class-validator';

// This class defines what data we need to create a new user
export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'myPassword123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, description: 'User age', example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(18)
  age?: number;

  @ApiProperty({
    required: false,
    description: 'User phone number',
    example: 1234567890,
  })
  @IsOptional()
  @IsNumber()
  phone?: number;
}
