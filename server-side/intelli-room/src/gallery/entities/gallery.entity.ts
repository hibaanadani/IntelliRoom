import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Gallery {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  @ApiProperty({ description: 'Unique gallery ID', example: 1 })
  id: number;

  @Column()
  @ApiProperty({ description: 'The name of the gallery', example: 'Ikea' })
  name: string;
}
