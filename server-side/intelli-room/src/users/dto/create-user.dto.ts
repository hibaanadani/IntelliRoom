// DTO = Data Transfer Object
// Think of this as a "form" that defines what data we expect when creating a user
// It helps us validate the data before saving it to the database

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, Min } from 'class-validator';

// This class defines what data we need to create a new user
export class CreateUserDto {
    // Name field - required
    @ApiProperty({ description: 'User full name', example: 'John Doe' })
    @IsString() // Must be text
    @IsNotEmpty() // Cannot be empty
    name: string;

    // Username field - required and unique
    @ApiProperty({ description: 'Unique username', example: 'johndoe123' })
    @IsString() // Must be text
    @IsNotEmpty() // Cannot be empty
    username: string;

    // Email field - required and must be valid email format
    @ApiProperty({ description: 'User email address', example: 'john@example.com' })
    @IsEmail() // Must be valid email format (contains @ and domain)
    @IsNotEmpty() // Cannot be empty
    email: string;

    // Password field - required, minimum 6 characters for security
    @ApiProperty({ description: 'User password (minimum 6 characters)', example: 'myPassword123' })
    @IsString() // Must be text
    @MinLength(6) // Must be at least 6 characters long
    password: string;
    
    // Age field - optional (the ? means it's not required)
    @ApiProperty({ required: false, description: 'User age', example: 25 })
    @IsOptional() // This field is not required
    @IsNumber() // If provided, must be a number
    @Min(1) // If provided, must be at least 1
    age?: number;

    // Phone field - optional
    @ApiProperty({ required: false, description: 'User phone number', example: 1234567890 })
    @IsOptional() // This field is not required
    @IsNumber() // If provided, must be a number
    phone?: number;
}
