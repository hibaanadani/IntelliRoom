//Added Logger import - NestJS built-in logging service
import { Inject, Injectable } from '@nestjs/common';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Db } from 'mongodb';
import { MONGO_DB } from '../mongodb/mongodb.module';

@Injectable()
export class UsersService {

    constructor(
        @Inject(MONGO_DB)
        private readonly db: Db,
    ){}
    // Use the shared "users" collection
    private collection() {
        return this.db.collection<User>('users');
    }

    async findAll(): Promise<User[]> {
        return this.collection()
            .find({}, { projection: { _id: 0 } })
            .toArray();
    }

    async findById(userId: number): Promise<User | undefined> {
        const user = await this.collection().findOne({ id: userId }, { projection: { _id: 0 } });
        return user ?? undefined;
    }

    async findByName(name: string): Promise<User[]> {
        if (!name?.trim()) {
            return [];
        }
        // match on a stored lowercase copy for case-insensitive exact search
        return this.collection()
            .find({ nameLower: name.trim().toLowerCase() } as any, { projection: { _id: 0, nameLower: 0 } })
            .toArray();
    }

    async findByUserName(userName: string): Promise<User | undefined> {
        const user = await this.collection().findOne({ username: userName }, { projection: { _id: 0 } });
        return user ?? undefined;
    }

    async createUser(createUserDto: createUserDto): Promise<User> {
        if (!createUserDto.name?.trim()) {
            throw new Error('Name is required and cannot be empty');
        }

        // Simple numeric id auto-increment by reading the last id
        const nextId = await this.getNextId();
        const newUser: User = {
            id: nextId,
            ...createUserDto,
            name: createUserDto.name.trim(),
        };
        await this.collection().insertOne({ ...newUser, nameLower: newUser.name.toLowerCase() } as any);
        return { ...newUser };
    }

    async updateUser(id: number, updateUserDto: updateUserDto): Promise<User | undefined> {
        if (updateUserDto.name !== undefined) {
            if (!updateUserDto.name?.trim()) {
                throw new Error('Name cannot be empty');
            }
            updateUserDto.name = updateUserDto.name.trim();
        }

        const $set: any = { ...updateUserDto };
        if (updateUserDto.name !== undefined) {
            $set.nameLower = updateUserDto.name.toLowerCase();
        }

        const result = await this.collection().findOneAndUpdate(
            { id },
            { $set },
            { returnDocument: 'after', projection: { _id: 0, nameLower: 0 } }
        );
        if (!result || !('value' in result) || !result.value) {
            return undefined;
        }
        return result.value as User;
    }

    async removeUser(id: number): Promise<boolean> {
        const res = await this.collection().deleteOne({ id });
        return res.deletedCount === 1;
    }
    
    async getUserCount(): Promise<number> {
        return this.collection().countDocuments();
    }

    async userExists(id: number): Promise<boolean> {
        const user = await this.collection().findOne({ id }, { projection: { id: 1 } });
        return !!user;
    }

    // Find the highest numeric id and increment by 1
    private async getNextId(): Promise<number> {
        const last = await this.collection().find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
        const lastId = last.length > 0 ? (last[0] as any).id : -1;
        return lastId + 1;
    }
}