import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ObjectId } from 'mongodb';
import { AdminGuard } from 'src/auth/admin.guard';

const mockUsersService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  removeUser: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockObjectId = new ObjectId('60c72b2f9b1d8e001f8e1a1a');
  const mockUser: User = {
    _id: mockObjectId,
    id: 1,
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    rooms: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockUser] as any);
      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return an array of users for a given name', async () => {
      const users = [mockUser];
      jest.spyOn(service, 'findByName').mockResolvedValue(users as any);
      const result = await controller.findByName('Test');
      expect(result).toEqual(users);
      expect(service.findByName).toHaveBeenCalledWith('Test');
    });
  });

  describe('findById', () => {
    it('should return a single user for a given ID', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as any);
      const result = await controller.findById(1);
      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createUser', () => {
    it('should successfully create and return a new user', async () => {
      const createUserDto = {
        fullname: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };
      const createdUser = {
        _id: new ObjectId('60c72b2f9b1d8e001f8e1a1b'),
        id: 2,
        fullname: 'New User',
        email: 'newuser@example.com',
        rooms: [],
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(createdUser as any);
      const result = await controller.createUser(createUserDto);
      expect(result).toEqual(createdUser);
      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should successfully update and return a user', async () => {
      const updateUserDto: UpdateUserDto = { fullname: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      jest.spyOn(service, 'updateUser').mockResolvedValue(updatedUser as any);
      const idToUpdate = mockObjectId.toHexString();
      const result = await controller.updateUser(idToUpdate, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(service.updateUser).toHaveBeenCalledWith(
        idToUpdate,
        updateUserDto,
      );
    });
  });

  describe('removeUser', () => {
    it('should successfully remove a user', async () => {
      jest.spyOn(service, 'removeUser').mockResolvedValue(undefined);
      const result = await controller.removeUser(1);
      expect(result).toBeUndefined();
      expect(service.removeUser).toHaveBeenCalledWith(1);
    });
  });
});
