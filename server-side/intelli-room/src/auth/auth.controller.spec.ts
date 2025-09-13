import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

const mockAuthService = () => ({
  login: jest.fn(),
  signup: jest.fn(),
});

const mockLoginResponse = {
  access_token: 'mock-access-token',
  user: {
    id: new ObjectId(),
    fullname: 'Test User',
    email: 'test@example.com',
    age: 30,
    phone: '123-456-7890',
  },
};

const mockCreateUserDto: CreateUserDto = {
  fullname: 'New User',
  email: 'newuser@example.com',
  password: 'password123',
};

const mockUser = {
  _id: new ObjectId(),
  fullname: 'Auth Guard User',
  email: 'auth.guard@example.com',
  age: 45,
  phone: '987-654-3210',
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService(),
        },
      ],
    })
      .overrideGuard(AuthGuard('local'))
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the login response', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(mockLoginResponse as any);

      const result = await controller.login({ user: mockUser } as any);

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle errors from the service', async () => {
      jest
        .spyOn(service, 'login')
        .mockRejectedValue(new UnauthorizedException('Authentication failed'));
      await expect(controller.login({ user: mockUser } as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('should call authService.signup and return the login response', async () => {
      jest.spyOn(service, 'signup').mockResolvedValue(mockLoginResponse as any);

      const result = await controller.signup(mockCreateUserDto);

      expect(service.signup).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle errors from the service', async () => {
      jest
        .spyOn(service, 'signup')
        .mockRejectedValue(new Error('User creation failed'));
      await expect(controller.signup(mockCreateUserDto)).rejects.toThrow(Error);
    });
  });
});
