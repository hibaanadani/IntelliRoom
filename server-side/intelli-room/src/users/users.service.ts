import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
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

    try {
      await this.usersRepository.save(newUser);
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      // Check for the specific Mongo duplicate key error (code 11000)
      if (error.code === 11000) {
        throw new BadRequestException(
          `Email '${createUserDto.email}' is already registered.`,
        );
      }
      throw error;
    }
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
}
