// This is the User Entity - it defines what a User looks like in our app
// Think of it as a "template" or "blueprint" for user data
// It matches exactly what we store in the database

import { ApiProperty } from "@nestjs/swagger";

export class User {
    // Unique ID for each user (like a student ID number)
    @ApiProperty({ description: 'Unique user ID', example: 1 })
    id: number;

    // User's full name
    @ApiProperty({ description: 'User full name', example: 'John Doe' })
    name: string;

    // Unique username for login
    @ApiProperty({ description: 'Unique username', example: 'johndoe123' })
    username: string;

    // User's email address
    @ApiProperty({ description: 'User email address', example: 'john@example.com' })
    email: string;

    // User's password (will be hashed/encrypted when saved)
    @ApiProperty({ description: 'User password (hashed)', example: '$2b$12$...' })
    password: string;

    // Optional fields (these might not always be present)
    @ApiProperty({ required: false, description: 'User age', example: 25 })
    age?: number;

    @ApiProperty({ required: false, description: 'User phone number', example: 1234567890 })
    phone?: number;
}
