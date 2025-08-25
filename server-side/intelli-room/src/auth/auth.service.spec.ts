import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MongodbModule } from '../mongodb/mongodb.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    process.env.USE_IN_MEMORY_MONGO = 'true';
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongodbModule, JwtModule.register({ secret: 'SECRET' })],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
