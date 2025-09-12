import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SEED_ON_BOOT === 'false') {
      return;
    }

    const count = await this.usersRepository.countDocuments();
    if (count > 0) {
      console.log('Database already has users, skipping seeder.');
      return;
    }

    const initialUsersData = [
      {
        fullname: 'Charbel Daoud',
        email: 'charbel@sefactory.com',
        password: 'charbel',
      },
      { fullname: 'Taha Taha', email: 'taha@sefactory.com', password: 'taha' },
      {
        fullname: 'Nour Mshawrab',
        email: 'nour@sefactory.com',
        password: 'nour',
      },
      { fullname: 'Joseph Matta', email: 'joe@sefactory.com', password: 'joe' },
    ];

    const highestIdUser = await this.usersRepository.findOne({
      order: { id: 'DESC' },
    });
    let nextId = highestIdUser ? highestIdUser.id + 1 : 1;

    const initialUsers = await Promise.all(
      initialUsersData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          id: nextId++,
          password: hashedPassword,
        };
      }),
    );

    await this.usersRepository.save(initialUsers);
    console.log('Initial users seeded successfully.');
  }
}
