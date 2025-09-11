import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export interface IndividualObjectAnalysis {
  object: string;
  classification: 'Good' | 'Bad';
}

export interface MLOutput {
  overallClassification: string;
  individualObjectAnalysis: IndividualObjectAnalysis[];
  actionableReport: string[];
}

export interface Room {
  id: string;
  name: string;
  mlOutput: MLOutput;
  imageUrl: string;
  createdAt: Date;
}

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: number;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  phone?: number;

  @Column()
  rooms: Room[];
}
