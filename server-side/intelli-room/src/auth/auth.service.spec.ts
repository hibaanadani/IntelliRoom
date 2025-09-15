import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersService = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUser = {
  id: new ObjectId(),
  _id: new ObjectId(),
  fullname: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  age: 30,
  phone: '123-456-7890',
};

const mockCreateUserDto: CreateUserDto = {
  fullname: 'New User',
  email: 'newuser@example.com',
  password: 'password123',
};

const mockAccessToken = 'mock-access-token';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // Corrected: Provide the UsersService class directly as the token
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return the user object without password if validation is successful', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password');

      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
      expect(result).toEqual({
        id: mockUser.id,
        _id: mockUser._id,
        fullname: mockUser.fullname,
        email: mockUser.email,
        age: mockUser.age,
        phone: mockUser.phone,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if password validation fails', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser(
        mockUser.email,
        'wrong-password',
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toBeNull();
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user data on successful login', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockAccessToken);
      const user = {
        _id: new ObjectId('60c72b2f9b1d8e001f8e1a1a'),
        email: mockUser.email,
        fullname: mockUser.fullname,
        age: mockUser.age,
        phone: mockUser.phone,
      };
      const result = await service.login(user);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user._id.toString(),
      });
      expect(result).toEqual({
        access_token: mockAccessToken,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          age: user.age,
          phone: user.phone,
        },
      });
    });
  });

  describe('signup', () => {
    it('should create a new user and log them in', async () => {
      const hashPasswordSpy = jest
        .spyOn(service, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      const newUser = {
        _id: new ObjectId('60c72b2f9b1d8e001f8e1a1b'),
        id: new ObjectId('60c72b2f9b1d8e001f8e1a1b'),
        fullname: mockCreateUserDto.fullname,
        email: mockCreateUserDto.email,
        password: 'hashedPassword',
        age: 25,
        phone: '123-456-7890',
      };
      jest.spyOn(usersService, 'createUser').mockResolvedValue(newUser as any);
      const loginSpy = jest.spyOn(service, 'login').mockResolvedValue({
        access_token: mockAccessToken,
        user: newUser,
      });

      const result = await service.signup(mockCreateUserDto);

      expect(hashPasswordSpy).toHaveBeenCalledWith(mockCreateUserDto.password);
      expect(usersService.createUser).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashedPassword',
      });
      expect(loginSpy).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({
        access_token: mockAccessToken,
        user: expect.objectContaining({
          id: newUser.id,
          fullname: newUser.fullname,
          email: newUser.email,
        }),
      });
    });
  });

  describe('hashPassword', () => {
    it('should hash the password with a salt', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const password = 'testPassword';
      const result = await service.hashPassword(password);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toEqual('hashedPassword');
    });
  });
});
