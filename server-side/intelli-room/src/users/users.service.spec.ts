import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MongodbModule } from '../mongodb/mongodb.module';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    process.env.USE_IN_MEMORY_MONGO = 'true';
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongodbModule],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
