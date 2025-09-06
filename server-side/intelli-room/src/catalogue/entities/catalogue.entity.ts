import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Catalogue {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  @ApiProperty({ description: 'Unique catalogue ID', example: 1 })
  id: number;

  @Column()
  @ApiProperty({ description: 'season of the catalogue', example: 'S-S2025' })
  season: string;

  @Column()
  @ApiProperty({
    description: 'ID of the gallery for which the catalogue belongs to',
    example: 10,
  })
  galleryId: number;
}
