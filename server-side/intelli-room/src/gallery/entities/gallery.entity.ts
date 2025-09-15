import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Gallery {
  @ObjectIdColumn({ primary: true })
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ nullable: true })
  catalogue: string | null;

  @Column({ nullable: true })
  coverImage: string | null;
}
