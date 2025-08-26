// The 'users' service. This file contains all the business logic and data access methods for users.
// It is designed to be independent of the HTTP layer.

import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Db } from 'mongodb';
import { MONGO_DB } from '../mongodb/mongodb.module';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    // We use dependency injection to get the MongoDB database connection.
    // This gets the database connection we made earlier.
    constructor(
        @Inject(MONGO_DB) 
        private readonly database: Db, 
    ) {}
    
    // A private helper function to get the 'users' collection from the database.
    // Think of a collection like a "table" in SQL or a "folder" for user records.
    private getUsersCollection() {
        return this.database.collection<User>('users');
    }

    // Why are we using 'projection'?
    // The `projection` option in MongoDB queries allows us to specify which fields to include or exclude from the result.
    // In our case, `{ projection: { _id: 0 } }` means:
    // - `_id: 0`: Don't return the default MongoDB `_id` field. This keeps our responses clean and standardized.
    // Using projection helps us control the data we send back, improving security and performance.

    // Get all users from the database.
    async findAll(): Promise<User[]> {
        return this.getUsersCollection()
            .find({}, { projection: { _id: 0 } })
            .toArray();
    }

    // Finds a single user by their ID.
    async findById(userId: number): Promise<User> {
        // Search for a user where the id field matches userId.
        const user = await this.getUsersCollection()
            .findOne({ id: userId }, { projection: { _id: 0 } });
            
        // If no user is found, we throw a `NotFoundException`. This is a business rule:
        // a request for a specific ID that doesn't exist is an error.
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }

    // Finds a list of users by name.
    async findByName(name: string): Promise<User[]> {
        // Return an empty array if the search name is empty or just whitespace.
        if (!name?.trim()) {
            return [];
        }
        
        // Search using a regular expression for case-insensitive matching.
        // The `i` flag makes the search case-insensitive.
        const users = await this.getUsersCollection()
            .find(
                { name: { $regex: new RegExp(name.trim(), 'i') } },
                { projection: { _id: 0 } }
            )
            .toArray();

        // If the search results are empty, we throw a 404 exception.
        if (users.length === 0) {
            throw new NotFoundException(`No users found with name: ${name}`);
        }
        
        return users;
    }
    
    // Find a user by their username (used for login).
    // This method returns the full user object, including the password, which is needed for authentication checks.
    async findByUserName(userName: string): Promise<User | undefined> {
        // Find user by exact username match.
        const user = await this.getUsersCollection()
            .findOne({ username: userName }, { projection: { _id: 0 } });
            
        return user || undefined;
    }

    // Creates a new user document after validation and processing.
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        // First, let's make sure we have the basic required stuff.
        if (!createUserDto.name?.trim()) {
            throw new BadRequestException('Name is required and cannot be empty');
        }
        if (!createUserDto.password) {
            throw new BadRequestException('Password is required');
        }

        // Check if someone already took this username.
        const usernameExists = await this.usernameExists(createUserDto.username);
        if (usernameExists) {
            throw new BadRequestException(`Username '${createUserDto.username}' is already taken. Please choose a different username.`);
        }

        // Check if this email is already registered.
        const emailExists = await this.emailExists(createUserDto.email);
        if (emailExists) {
            throw new BadRequestException(`Email '${createUserDto.email}' is already registered. Please use a different email or try logging in.`);
        }

        // Hash the password so we never store it in plain text.
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        // Figure out what ID number to give this new user.
        const nextId = await this.getNextUserId();
        
        // Build the user object with all their info.
        const newUser: User = {
            id: nextId,
            ...createUserDto,
            name: createUserDto.name.trim(),
            password: hashedPassword,
        };
        
        // Actually save the user to the database.
        await this.getUsersCollection().insertOne(newUser as any);
        
        // Return the user info but strip out the password for security.
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    }

    // Updates an existing user's details.
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        // Make sure name isn't empty if they're trying to update it.
        if (updateUserDto.name !== undefined) {
            if (!updateUserDto.name?.trim()) {
                throw new BadRequestException('Name cannot be empty');
            }
            updateUserDto.name = updateUserDto.name.trim();
        }

        // Prepare the update object, hashing the password if it is being updated.
        const updateData: any = { ...updateUserDto };
        
        // Hash password if it's being updated (security!)
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        // Find and update the document, and return the updated version.
        const result = await this.getUsersCollection().findOneAndUpdate(
            { id },
            { $set: updateData },
            { 
                returnDocument: 'after',
                projection: { _id: 0 }
            }
        );
        
        // If the update operation didn't find a matching user, we throw a 404.
        if (!result) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        
        return result as User;
    }

    // Deletes a user document.
    async removeUser(id: number): Promise<void> {
        // Perform the deletion operation based on the user's ID.
        const result = await this.getUsersCollection().deleteOne({ id });
        
        // Check the `deletedCount` to confirm the user existed and was removed.
        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
    
    // (Helper methods below, used internally by this service)
    // Check if a username already exists (for duplicate checking).
    async usernameExists(username: string): Promise<boolean> {
        // Just check if we can find a user with this username.
        const user = await this.getUsersCollection()
            .findOne({ username }, { projection: { id: 1 } });
        // The `!!` converts the result to a simple `true` or `false`.
        return !!user;
    }

    // Check if an email already exists (for duplicate checking).
    async emailExists(email: string): Promise<boolean> {
        // Just check if we can find a user with this email.
        const user = await this.getUsersCollection()
            .findOne({ email }, { projection: { id: 1 } });
        return !!user;
    }
    
    // Helper function to get the next available user ID.
    // This finds the highest ID number and adds 1.
    private async getNextUserId(): Promise<number> {
        // Find the user with the highest ID number.
        const usersWithHighestId = await this.getUsersCollection()
            .find({}, { projection: { id: 1 } })
            .sort({ id: -1 })
            .limit(1)
            .toArray();
            
        // If there are any users, the new ID is the highest ID plus one. Otherwise, we start at 1.
        return usersWithHighestId.length > 0 ? usersWithHighestId[0].id + 1 : 1;
    }
}