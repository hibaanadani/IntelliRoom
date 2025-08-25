import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongodbModule } from 'src/mongodb/mongodb.module';
import { UsersSeeder } from './users.seeder';

@Module({
  imports:[MongodbModule],
  controllers: [UsersController],
  providers: [UsersService, UsersSeeder],
  exports:[UsersService]
})
export class UsersModule {}
