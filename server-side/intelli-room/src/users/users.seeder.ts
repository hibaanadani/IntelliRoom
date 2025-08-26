import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGO_DB } from 'src/mongodb/mongodb.module';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersSeeder implements OnModuleInit {
    constructor(
        @Inject(MONGO_DB)
        private readonly db: Db,
    ) {}

    private collection() {
        return this.db.collection<User>('users');
    }

    async onModuleInit(): Promise<void> {
        // Optional flag to disable on boot
        if (process.env.SEED_ON_BOOT === 'false') {
            return;
        }

        // Ensure indexes for performance and uniqueness
        await this.collection().createIndex({ username: 1 }, { unique: true });
        await this.collection().createIndex({ id: 1 }, { unique: true });
        // Add an index on lowercase name for simple case-insensitive search
        await this.collection().createIndex({ nameLower: 1 });

        const count = await this.collection().countDocuments();
        if (count > 0) {
            return;
        }

        const initialUsersData= [
            { id: 0, name: 'Charbel Daoud', nameLower: 'charbel daoud', username: 'charbeldaoud', email: 'charbel@sefactory.com', password: 'charbel' },
            { id: 1, name: 'Taha Taha', nameLower: 'taha taha', username: 'tahataha', email: 'taha@sefactory.com', password: 'taha' },
            { id: 2, name: 'Nour Mshawrab', nameLower: 'nour mshawrab', username: 'nourmshawrab', email: 'nour@sefactory.com', password: 'nour' },
            { id: 3, name: 'Joseph Matta', nameLower: 'joseph matta', username: 'josephmatta', email: 'joe@sefactory.com', password: 'joe' },
        ];

        // Hash all passwords before inserting
        const initialUsers = await Promise.all(
            initialUsersData.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 12)
            }))
        );

        await this.collection().insertMany(initialUsers as any);
    }
}


