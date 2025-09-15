// This DTO defines the expected structure of the login request body.
// It uses decorators from `class-validator` and `class-transformer` for validation.

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'The users unique email address',
    example: 'john@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The users password',
    example: 'myPassword123',
  })
  password: string;
}
