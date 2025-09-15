import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { id: 'ASC' },
    });
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
    if (!name) {
      return [];
    }
    const users = await this.usersRepository.find({
      where: { fullname: new RegExp(name.trim(), 'i') },
    });
    if (users.length === 0) {
      throw new NotFoundException(`No users found with name: ${name}`);
    }
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const nextId = await this.getNextUserId();

    const newUser = this.usersRepository.create({
      id: nextId,
      ...createUserDto,
      rooms: [],
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

    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format.');
    }

    const user = await this.usersRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
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
