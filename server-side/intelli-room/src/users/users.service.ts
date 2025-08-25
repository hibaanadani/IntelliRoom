// This service handles all user-related database operations
// Think of it as the "librarian" that manages the user records in our database

import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Db } from 'mongodb';
import { MONGO_DB } from '../mongodb/mongodb.module';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

    // Step 1: Get the database connection that was created in MongodbModule
    constructor(
        @Inject(MONGO_DB) // This gets the database connection we made earlier
        private readonly database: Db, // Now we have access to MongoDB!
    ) {
        console.log('📚 UsersService is ready to work with the database!');
    }
    
    // Step 2: Helper function to get the "users" collection from the database
    // Think of a collection like a "table" in SQL or a "folder" for user records
    private getUsersCollection() {
        return this.database.collection<User>('users');
    }

    // Step 3: Get all users from the database
    async findAll(): Promise<User[]> {
        console.log('📋 Getting all users from database...');
        
        // Get the users collection and find all documents
        // projection: { _id: 0 } means "don't include the MongoDB _id field"
        return this.getUsersCollection()
            .find({}, { projection: { _id: 0, nameLower: 0 } })
            .toArray();
    }

    // Step 4: Find a specific user by their ID number
    async findById(userId: number): Promise<User | undefined> {
        console.log(`🔍 Looking for user with ID: ${userId}`);
        
        // Search for a user where the id field matches userId
        const user = await this.getUsersCollection()
            .findOne({ id: userId }, { projection: { _id: 0, nameLower: 0 } });
            
        return user || undefined; // Return user if found, undefined if not
    }

    // Step 5: Find users by name (case-insensitive search)
    async findByName(name: string): Promise<User[]> {
        if (!name?.trim()) {
            console.log('⚠️  No name provided for search');
            return []; // Return empty array if no name provided
        }
        
        console.log(`🔍 Searching for users with name: ${name}`);
        
        // Search using the lowercase version for case-insensitive matching
        return this.getUsersCollection()
            .find(
                { nameLower: name.trim().toLowerCase() }, 
                { projection: { _id: 0, nameLower: 0 } }
            )
            .toArray();
    }

    // Step 6: Find a user by their username (for login)
    async findByUserName(userName: string): Promise<User | undefined> {
        console.log(`🔍 Looking for user with username: ${userName}`);
        
        // Find user by exact username match
        const user = await this.getUsersCollection()
            .findOne({ username: userName }, { projection: { _id: 0, nameLower: 0 } });
            
        return user || undefined;
    }

    // Step 7: Create a new user in the database
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        console.log(`🆕 Creating new user: ${createUserDto.username}`);
        
        // Step 7a: Validate the input data
        if (!createUserDto.name?.trim()) {
            throw new BadRequestException('Name is required and cannot be empty');
        }
        if (!createUserDto.password) {
            throw new BadRequestException('Password is required');
        }

        // Step 7b: Hash the password for security (never store plain text passwords!)
        console.log('🔐 Hashing password for security...');
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        // Step 7c: Get the next available ID number
        const nextId = await this.getNextUserId();
        
        // Step 7d: Create the user object with all the data
        const newUser: User = {
            id: nextId,
            ...createUserDto,
            name: createUserDto.name.trim(),
            password: hashedPassword,
        };
        
        // Step 7e: Save the user to the database
        // We also store a lowercase version of the name for easy searching
        await this.getUsersCollection().insertOne({ 
            ...newUser, 
            nameLower: newUser.name.toLowerCase() 
        } as any);
        
        console.log(`✅ Successfully created user with ID: ${nextId}`);
        
        // Step 7f: Return user data WITHOUT the password (for security)
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    }

    // Step 8: Update an existing user's information
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
        console.log(`🔄 Updating user with ID: ${id}`);
        
        // Step 8a: Validate name if it's being updated
        if (updateUserDto.name !== undefined) {
            if (!updateUserDto.name?.trim()) {
                throw new BadRequestException('Name cannot be empty');
            }
            updateUserDto.name = updateUserDto.name.trim();
        }

        // Step 8b: Prepare the update data
        const updateData: any = { ...updateUserDto };
        
        // Add lowercase name for searching if name is being updated
        if (updateUserDto.name !== undefined) {
            updateData.nameLower = updateUserDto.name.toLowerCase();
        }

        // Hash password if it's being updated (security!)
        if (updateUserDto.password) {
            console.log('🔐 Hashing new password...');
            updateData.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        // Step 8c: Update the user in the database
        const result = await this.getUsersCollection().findOneAndUpdate(
            { id }, // Find user by ID
            { $set: updateData }, // Update with new data
            { 
                returnDocument: 'after', // Return the updated user
                projection: { _id: 0, nameLower: 0 } // Don't include MongoDB _id or nameLower
            }
        );
        
        // Step 8d: Check if update was successful
        if (!result || !result.value) {
            console.log(`⚠️  User with ID ${id} not found for update`);
            return undefined;
        }
        
        console.log(`✅ Successfully updated user with ID: ${id}`);
        return result.value as User;
    }

    // Step 9: Delete a user from the database
    async removeUser(id: number): Promise<boolean> {
        console.log(`🗑️  Deleting user with ID: ${id}`);
        
        // Delete the user and get result
        const result = await this.getUsersCollection().deleteOne({ id });
        
        // Check if deletion was successful (deletedCount = 1 means success)
        const wasDeleted = result.deletedCount === 1;
        
        if (wasDeleted) {
            console.log(`✅ Successfully deleted user with ID: ${id}`);
        } else {
            console.log(`⚠️  User with ID ${id} not found for deletion`);
        }
        
        return wasDeleted;
    }
    
    // Step 10: Count how many users are in the database
    async getUserCount(): Promise<number> {
        console.log('📊 Counting total users in database...');
        
        const count = await this.getUsersCollection().countDocuments();
        console.log(`📊 Total users in database: ${count}`);
        
        return count;
    }

    // Step 11: Check if a user exists (simple true/false)
    async userExists(id: number): Promise<boolean> {
        console.log(`🔍 Checking if user with ID ${id} exists...`);
        
        // Just check if we can find the user (only get the id field to be efficient)
        const user = await this.getUsersCollection()
            .findOne({ id }, { projection: { id: 1 } });
        
        const exists = !!user; // Convert to boolean (!! means "convert to true/false")
        console.log(`🔍 User with ID ${id} ${exists ? 'exists' : 'does not exist'}`);
        
        return exists;
    }

    // Step 12: Helper function to get the next available user ID
    // This finds the highest ID number and adds 1
    private async getNextUserId(): Promise<number> {
        console.log('🔢 Finding next available user ID...');
        
        // Find the user with the highest ID number
        const usersWithHighestId = await this.getUsersCollection()
            .find({}, { projection: { id: 1 } }) // Only get the id field
            .sort({ id: -1 }) // Sort by id descending (highest first)
            .limit(1) // Only get the first (highest) result
            .toArray();
        
        // If there are no users yet, start with ID 1, otherwise add 1 to the highest
        const nextId = usersWithHighestId.length > 0 ? usersWithHighestId[0].id + 1 : 1;
        
        console.log(`🔢 Next user ID will be: ${nextId}`);
        return nextId;
    }
}