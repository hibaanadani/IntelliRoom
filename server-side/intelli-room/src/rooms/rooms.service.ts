import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MongoRepository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
import { ObjectId } from 'mongodb';
import * as fs from 'fs';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { MlModelService } from 'src/ml-model/ml-model.service'; // <-- Import the new service

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    private configService: ConfigService,
    private readonly mlModelService: MlModelService, // <-- Inject the new service
  ) {}

  private async findUserByObjectIdOrId(
    userObjectId: string,
  ): Promise<User | null> {
    if (ObjectId.isValid(userObjectId)) {
      return this.usersRepository.findOne({
        where: { _id: new ObjectId(userObjectId) },
      });
    } else {
      return this.usersRepository.findOneBy({ id: Number(userObjectId) });
    }
  }

  // New method to handle the file and room creation
  async saveRoomWithImage(
    userObjectId: string,
    roomData: string, // <-- Now a plain string
    file: Express.Multer.File,
  ): Promise<RoomDto> {
    // Business logic and validation now live here
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }
    const createRoomDto: CreateRoomDto = JSON.parse(roomData);

    // --- NEW LOGIC: Get ML Analysis ---
    const mlOutput = await this.mlModelService.analyzeRoom(file);
    createRoomDto.mlOutput = mlOutput;
    // --- END NEW LOGIC ---

    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const filename = `${randomName}${extname(file.originalname)}`;
    const destinationPath = `./uploads/${filename}`;

    fs.writeFileSync(destinationPath, file.buffer);

    const apiBaseUrl = this.configService.get<string>('API_BASE_URL');

    const imageUrl = `${apiBaseUrl}/uploads/${filename}`;

    createRoomDto.imageUrl = imageUrl;

    return this.saveRoom(userObjectId, createRoomDto);
  }

  // The rest of your service methods remain the same...
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
