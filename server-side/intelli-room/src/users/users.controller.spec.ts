import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongodbModule } from '../mongodb/mongodb.module';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    process.env.USE_IN_MEMORY_MONGO = 'true';
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongodbModule],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
