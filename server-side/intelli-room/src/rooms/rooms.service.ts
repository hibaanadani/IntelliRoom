import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MongoRepository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
  ) {}

  private async findUserByObjectIdOrId(
    userObjectId: string,
  ): Promise<User | null> {
    if (ObjectId.isValid(userObjectId)) {
      // Check if the parameter is a valid MongoDB ObjectId
      return this.usersRepository.findOne({
        where: { _id: new ObjectId(userObjectId) },
      });
    } else {
      // Fallback to querying by the 'id' number
      return this.usersRepository.findOneBy({ id: Number(userObjectId) });
    }
  }

  async saveRoom(
    userObjectId: string,
    createRoomDto: CreateRoomDto,
  ): Promise<RoomDto> {
    const user = await this.findUserByObjectIdOrId(userObjectId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userObjectId} not found`);
    }

    const newRoom = {
      id: new ObjectId().toString(),
      ...createRoomDto,
      createdAt: new Date(),
    };

    user.rooms.push(newRoom);
    await this.usersRepository.save(user);

    return newRoom;
  }

  async getUserRooms(userObjectId: string): Promise<RoomDto[]> {
    const user = await this.findUserByObjectIdOrId(userObjectId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userObjectId} not found`);
    }

    return user.rooms;
  }

  async deleteRoom(userObjectId: string, roomId: string): Promise<void> {
    const user = await this.findUserByObjectIdOrId(userObjectId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userObjectId} not found`);
    }

    const initialRoomCount = user.rooms.length;
    user.rooms = user.rooms.filter((room) => room.id !== roomId);

    if (user.rooms.length === initialRoomCount) {
      throw new NotFoundException(
        `Room with ID ${roomId} not found for user ${userObjectId}`,
      );
    }

    await this.usersRepository.save(user);
  }
}
