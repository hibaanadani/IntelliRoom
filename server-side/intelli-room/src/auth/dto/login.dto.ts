// src/auth/dto/login.dto.ts

// This DTO defines the expected structure of the login request body.
// It uses decorators from `class-validator` and `class-transformer` for validation.

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    // The @IsNotEmpty() decorator ensures the field is not an empty string, null, or undefined.
    // The @IsString() decorator ensures the field is a string.
    @IsNotEmpty()
    @IsString()
    // The @ApiProperty decorator is what tells Swagger to display this parameter.
    @ApiProperty({
        description: 'The users unique username',
        example: 'namelastname'
    })
    username: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The users password',
        example: 'name123'
    })
    password: string;
}
