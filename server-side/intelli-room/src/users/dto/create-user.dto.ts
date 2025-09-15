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
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  fullname: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
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
