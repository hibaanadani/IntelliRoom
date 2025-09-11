import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Room, MLOutput } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findByName(name: string): Promise<User[]> {
    if (!name?.trim()) {
      return [];
    }
    const users = await this.usersRepository.find({
      where: { name: new RegExp(name.trim(), 'i') },
    });
    if (users.length === 0) {
      throw new NotFoundException(`No users found with name: ${name}`);
    }
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.fullname?.trim()) {
      throw new BadRequestException(
        'Full name is required and cannot be empty',
      );
    }
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const nextId = await this.getNextUserId();

    const newUser = this.usersRepository.create({
      id: nextId,
      ...createUserDto,
      fullname: createUserDto.fullname.trim(),
      password: hashedPassword,
    });

    let savedUser: User;
    try {
      savedUser = await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Email '${createUserDto.email}' is already registered.`,
        );
      }
      throw error;
    }

    await this.usersRepository.findOneAndUpdate(
      { id: savedUser.id },
      { $set: { rooms: [] } },
      { returnDocument: 'after' },
    );

    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.fullname !== undefined) {
      if (!updateUserDto.fullname?.trim()) {
        throw new BadRequestException('Full name cannot be empty');
      }
      updateUserDto.fullname = updateUserDto.fullname.trim();
    }
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    Object.assign(user, updateUserDto);
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 12);
    }
    const updatedUser = await this.usersRepository.save(user);
    return updatedUser;
  }

  async removeUser(id: number): Promise<void> {
    const result = await this.usersRepository.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const userCount = await this.usersRepository.count({
      where: { email },
    });
    return userCount > 0;
  }

  private async getNextUserId(): Promise<number> {
    const highestIdUser = await this.usersRepository.findOne({
      order: { id: 'DESC' },
    });
    return highestIdUser ? highestIdUser.id + 1 : 1;
  }

  async addRoomWithImage(
    userId: number,
    roomDataString: string,
    image: Express.Multer.File,
  ): Promise<User> {
    if (!image) {
      throw new BadRequestException('Image file is required.');
    }

    let parsedRoomData: { name: string; mlOutput: MLOutput };

    // This handles the invalid JSON data from your frontend
    try {
      parsedRoomData = JSON.parse(roomDataString);
    } catch (error) {
      console.warn(
        'Failed to parse mlOutput from frontend. Using default values.',
      );
      parsedRoomData = {
        name: 'Default Room Name',
        mlOutput: {
          overallClassification: 'Unknown',
          individualObjectAnalysis: [],
          actionableReport: ['An error occurred with the ML output format.'],
        },
      };
    }

    const API_BASE_URL = this.configService.get<string>('API_BASE_URL');

    const newRoom: Room = {
      id: new ObjectId().toHexString(),
      name: parsedRoomData.name,
      mlOutput: parsedRoomData.mlOutput,
      imageUrl: `${API_BASE_URL}/uploads/${image.filename}`,
      createdAt: new Date(),
    };

    const updatedUserResult = await this.usersRepository.findOneAndUpdate(
      { id: userId },
      { $push: { rooms: newRoom } },
      { returnDocument: 'after' },
    );

    if (!updatedUserResult) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    return updatedUserResult.value;
  }

  async findByIdWithRooms(userId: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return user;
  }

  async removeRoom(userId: number, roomId: string): Promise<User> {
    const updatedUserResult = await this.usersRepository.findOneAndUpdate(
      { id: userId },
      { $pull: { rooms: { id: roomId } } },
      { returnDocument: 'after' },
    );

    if (!updatedUserResult) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    if (!updatedUserResult.value) {
      throw new NotFoundException(
        `Room with ID "${roomId}" not found for user "${userId}".`,
      );
    }

    return updatedUserResult.value;
  }
}
