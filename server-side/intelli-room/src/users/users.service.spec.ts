import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthService } from 'src/auth/auth.service';

const mockMongoRepository = () => ({
  findOneBy: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  deleteOne: jest.fn(),
  findOne: jest.fn(),
});

const mockAuthService = {
  hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MongoRepository<User>;

  const mockUser: User = {
    _id: new ObjectId('60c72b2f9b1d8e001f8e1a1a'),
    id: 1,
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    rooms: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockMongoRepository(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<MongoRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users as any);
      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      const result = await service.findByEmail('not-found@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return an array of users matching the name', async () => {
      const users = [mockUser];
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users as any);
      const result = await service.findByName('Test');
      expect(result).toEqual(users);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { fullname: new RegExp('Test', 'i') },
      });
    });

    it('should return an empty array if name is null or empty', async () => {
      const result = await service.findByName('');
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if no users are found', async () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([]);
      await expect(service.findByName('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    const createUserDto = {
      fullname: 'New User',
      email: 'newuser@example.com',
      password: 'newPassword123',
    };

    it('should successfully create a new user', async () => {
      const newUser = {
        _id: new ObjectId('60c72b2f9b1d8e001f8e1a1b'),
        id: 2,
        fullname: 'New User',
        email: 'newuser@example.com',
        rooms: [],
        password: 'hashedPassword123',
      };

      jest.spyOn(service as any, 'getNextUserId').mockResolvedValue(2);
      jest.spyOn(usersRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(newUser as any);

      const result = await service.createUser(createUserDto);

      // Corrected line: We now expect the `rooms` property to be included.
      expect(usersRepository.create).toHaveBeenCalledWith({
        id: 2,
        ...createUserDto,
        rooms: [],
      });
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: 2,
          fullname: newUser.fullname,
          email: newUser.email,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should handle duplicate email gracefully', async () => {
      jest.spyOn(usersRepository, 'save').mockRejectedValue({ code: 11000 });
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const updateUserDto = { fullname: 'Updated User' };
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({ ...mockUser, ...updateUserDto } as any);
      const result = await service.updateUser(1, updateUserDto);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result.fullname).toEqual(updateUserDto.fullname);
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should hash the password if it is updated', async () => {
      const dtoWithPassword = { password: 'newPassword123' };
      const updatedUser = { ...mockUser, password: 'hashedPassword' };

      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      mockAuthService.hashPassword.mockResolvedValue('hashedPassword');
      jest.spyOn(usersRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.updateUser(1, dtoWithPassword);

      expect(mockAuthService.hashPassword).toHaveBeenCalledWith(
        'newPassword123',
      );
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.updateUser(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUser', () => {
    it('should successfully remove a user', async () => {
      jest
        .spyOn(usersRepository, 'deleteOne')
        .mockResolvedValue({ deletedCount: 1 } as any);
      await expect(service.removeUser(1)).resolves.toBeUndefined();
      expect(usersRepository.deleteOne).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      jest
        .spyOn(usersRepository, 'deleteOne')
        .mockResolvedValue({ deletedCount: 0 } as any);
      await expect(service.removeUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      jest.spyOn(usersRepository, 'count').mockResolvedValue(1);
      const result = await service.emailExists('test@example.com');
      expect(result).toBeTruthy();
    });

    it('should return false if email does not exist', async () => {
      jest.spyOn(usersRepository, 'count').mockResolvedValue(0);
      const result = await service.emailExists('non-existent@example.com');
      expect(result).toBeFalsy();
    });
  });
});
