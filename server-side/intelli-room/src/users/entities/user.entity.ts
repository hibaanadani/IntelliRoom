// This is the User Entity - it defines what a User looks like in our app
// Think of it as a "template" or "blueprint" for user data
// It matches exactly what we store in the database

import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

// The @Entity() decorator marks this class as a TypeORM entity.
@Entity()
export class User {
  // @ObjectIdColumn() maps this property to MongoDB's native _id primary key.
  @ObjectIdColumn()
  _id: ObjectId;

  // @Column() maps this property to a field in the MongoDB collection.
  // We use our custom sequential 'id' for application logic.
  @Column({ unique: true })
  @ApiProperty({ description: 'Unique user ID', example: 1 })
  id: number;

  @Column()
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  fullname: string;

  @Column({ unique: true })
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @Column()
  @ApiProperty({ description: 'User password (hashed)', example: '$2b$12$...' })
  password: string;

  @Column()
  @ApiProperty({ required: false, description: 'User age', example: 25 })
  age?: number;

  @Column()
  @ApiProperty({
    required: false,
    description: 'User phone number',
    example: 1234567890,
  })
  phone?: number;
}
