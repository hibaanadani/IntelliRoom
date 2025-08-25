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

    // Get the database connection when this service starts up
    constructor(
        @Inject(MONGO_DB) // This gets the database connection we made earlier
        private readonly database: Db, // Now we have access to MongoDB!
    ) {
        console.log('📚 UsersService is ready to work with the database!');
    }
    
    // Helper function to get the "users" collection from the database
    // Think of a collection like a "table" in SQL or a "folder" for user records
    private getUsersCollection() {
        return this.database.collection<User>('users');
    }

    // Get all users from the database
    async findAll(): Promise<User[]> {
        console.log('📋 Getting all users from database...');
        
        // Get the users collection and find all documents
        // projection: { _id: 0 } means "don't include the MongoDB _id field"
        return this.getUsersCollection()
            .find({}, { projection: { _id: 0, nameLower: 0 } })
            .toArray();
    }

    // Find a specific user by their ID number
    async findById(userId: number): Promise<User | undefined> {
        console.log(`🔍 Looking for user with ID: ${userId}`);
        
        // Search for a user where the id field matches userId
        const user = await this.getUsersCollection()
            .findOne({ id: userId }, { projection: { _id: 0, nameLower: 0 } });
            
        return user || undefined; // Return user if found, undefined if not
    }

    // Find users by name (case-insensitive search)
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

    // Find a user by their username (used for login)
    async findByUserName(userName: string): Promise<User | undefined> {
        console.log(`🔍 Looking for user with username: ${userName}`);
        
        // Find user by exact username match
        const user = await this.getUsersCollection()
            .findOne({ username: userName }, { projection: { _id: 0, nameLower: 0 } });
            
        return user || undefined;
    }

    // Check if a username already exists (for duplicate checking)
    async usernameExists(username: string): Promise<boolean> {
        console.log(`🔍 Checking if username '${username}' already exists...`);
        
        // Just check if we can find a user with this username (only get the id field to be efficient)
        const user = await this.getUsersCollection()
            .findOne({ username }, { projection: { id: 1 } });
        
        const exists = !!user; // Convert to boolean
        console.log(`🔍 Username '${username}' ${exists ? 'already exists' : 'is available'}`);
        
        return exists;
    }

    // Check if an email already exists (for duplicate checking)
    async emailExists(email: string): Promise<boolean> {
        console.log(`🔍 Checking if email '${email}' already exists...`);
        
        // Just check if we can find a user with this email (only get the id field to be efficient)
        const user = await this.getUsersCollection()
            .findOne({ email }, { projection: { id: 1 } });
        
        const exists = !!user; // Convert to boolean
        console.log(`🔍 Email '${email}' ${exists ? 'already exists' : 'is available'}`);
        
        return exists;
    }

    // Create a new user in the database
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        console.log(`🆕 Creating new user: ${createUserDto.username}`);
        
        // First, let's make sure they gave us the basic required stuff
        if (!createUserDto.name?.trim()) {
            throw new BadRequestException('Name is required and cannot be empty');
        }
        if (!createUserDto.password) {
            throw new BadRequestException('Password is required');
        }

        // Check if someone already took this username
        console.log('🔍 Checking if username already exists...');
        const usernameExists = await this.usernameExists(createUserDto.username);
        if (usernameExists) {
            throw new BadRequestException(`Username '${createUserDto.username}' is already taken. Please choose a different username.`);
        }

        // Check if this email is already registered
        console.log('🔍 Checking if email already exists...');
        const emailExists = await this.emailExists(createUserDto.email);
        if (emailExists) {
            throw new BadRequestException(`Email '${createUserDto.email}' is already registered. Please use a different email or try logging in.`);
        }

        // Hash the password so we never store it in plain text
        console.log('🔐 Hashing password for security...');
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

        // Figure out what ID number to give this new user
        const nextId = await this.getNextUserId();
        
        // Build the user object with all their info
        const newUser: User = {
            id: nextId,
            ...createUserDto,
            name: createUserDto.name.trim(),
            password: hashedPassword,
        };
        
        // Actually save the user to the database
        // We also store a lowercase version of the name for easy searching
        await this.getUsersCollection().insertOne({ 
            ...newUser, 
            nameLower: newUser.name.toLowerCase() 
        } as any);
        
        console.log(`✅ Successfully created user with ID: ${nextId}`);
        
        // Return the user info but strip out the password for security
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    }

    // Update an existing user's information
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
        console.log(`🔄 Updating user with ID: ${id}`);
        
        // Make sure name isn't empty if they're trying to update it
        if (updateUserDto.name !== undefined) {
            if (!updateUserDto.name?.trim()) {
                throw new BadRequestException('Name cannot be empty');
            }
            updateUserDto.name = updateUserDto.name.trim();
        }

        // Prepare the update data
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

        // Actually update the user in the database
        const result = await this.getUsersCollection().findOneAndUpdate(
            { id }, // Find user by ID
            { $set: updateData }, // Update with new data
            { 
                returnDocument: 'after', // Return the updated user
                projection: { _id: 0, nameLower: 0 } // Don't include MongoDB _id or nameLower
            }
        );
        
        // Check if update was successful
        if (!result || !result.value) {
            console.log(`⚠️  User with ID ${id} not found for update`);
            return undefined;
        }
        
        console.log(`✅ Successfully updated user with ID: ${id}`);
        return result.value as User;
    }

    // Delete a user from the database
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
    
    // Count how many users are in the database
    async getUserCount(): Promise<number> {
        console.log('📊 Counting total users in database...');
        
        const count = await this.getUsersCollection().countDocuments();
        console.log(`📊 Total users in database: ${count}`);
        
        return count;
    }

    // Check if a user exists (simple true/false)
    async userExists(id: number): Promise<boolean> {
        console.log(`🔍 Checking if user with ID ${id} exists...`);
        
        // Just check if we can find the user (only get the id field to be efficient)
        const user = await this.getUsersCollection()
            .findOne({ id }, { projection: { id: 1 } });
        
        const exists = !!user; // Convert to boolean (!! means "convert to true/false")
        console.log(`🔍 User with ID ${id} ${exists ? 'exists' : 'does not exist'}`);
        
        return exists;
    }

    // Helper function to get the next available user ID
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