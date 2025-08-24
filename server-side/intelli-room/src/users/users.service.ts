//Added Logger import - NestJS built-in logging service
import { Inject, Injectable } from '@nestjs/common';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Db } from 'mongodb'; 

@Injectable()
export class UsersService {

    constructor(
        @Inject('MONGO_DB')
        private readonly db:Db,
    ){}
    // Our in-memory user storage
    private users: User[] = [
        { id: 0, name: 'Charbel Daoud', username:'charbeldaoud', email:'charbel@sefactory.com',password:'charbel' },
        { id: 1, name: 'Taha Taha', username:'tahataha', email:'taha@sefactory.com',password:'taha' },
        { id: 2, name: 'Nour Mshawrab', username:'nourmshawrab', email:'nour@sefactory.com',password:'nour' },
        { id: 3, name: 'Joseph Matta', username:'josephmatta', email:'joe@sefactory.com',password:'joe' }
    ];
    
    // Track next available ID instead of using Date.now()
    // This prevents ID conflicts and gives us sequential IDs
    private nextId = 4;

    // : User[] provides return type, important to help catch bugs early
    findAll(): User[] {
        // Return a copy of the array using spread operator
        // This prevents external code from modifying our internal users array
        return [...this.users];
    }

    findById(userId: number): User | undefined {
        const user = this.users.find(user => user.id === userId);
        
        // Return a copy of the user object (or undefined if not found)
        // This prevents external code from modifying our internal user data
        return user ? { ...user } : undefined;
    }

    findByName(name: string): User[] {
        // Input validation - check for empty/null/undefined names
        if (!name?.trim()) {
            return [];
        }
        
        // Case-insensitive partial matching using includes()
        // This is more user-friendly than exact matching
        const matchedUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
        );
        
        // Return copies of matched users to prevent external mutations
        return matchedUsers.map(user => ({ ...user }));
    }

    async findByUserName(userName: string): Promise<User | undefined> {
        return this.users.find(user => 
            user.username===userName
        );
    }

    // ... spreading since we will connect to a db later on and we will need more than the name
    createUser(createUserDto: createUserDto): User {
        // Input validation - ensure name is provided and not empty
        if (!createUserDto.name?.trim()) {
            throw new Error('Name is required and cannot be empty');
        }

        // Optional business logic - check for duplicate names
        // You can enable this based on your business requirements
        const existingUser = this.users.find(user => 
            user.name.toLowerCase() === createUserDto.name.toLowerCase()
        );
        
        // Use sequential ID instead of Date.now()
        // trim the name to remove extra whitespace
        const newUser: User = {
            id: this.nextId++,  // Increment and use the next available ID
            ...createUserDto,
            name: createUserDto.name.trim()  // Remove leading/trailing spaces
        };
        
        this.users.push(newUser);
        
        //Return a copy to prevent external modifications
        return { ...newUser };
    }

    updateUser(id: number, updateUserDto: updateUserDto): User | undefined {
        const userIndex = this.users.findIndex(user => user.id === id);
        
        // If user not found, log and return undefined
        if (userIndex === -1) {
            return undefined;
        }
        if (updateUserDto.name !== undefined) {
            if (!updateUserDto.name?.trim()) {
                throw new Error('Name cannot be empty');
            }
            updateUserDto.name = updateUserDto.name.trim();
        }

        // NEW: Keep track of original data for logging
        const originalUser = { ...this.users[userIndex] };
        
        // Update the user with new data (partial update using spread operator)
        this.users[userIndex] = {
            ...this.users[userIndex],  // Keep existing properties
            ...updateUserDto           // Override with new properties
        };

        // Return a copy of the updated user
        return { ...this.users[userIndex] };
    }

    removeUser(id: number): boolean {
        const userIndex = this.users.findIndex(user => user.id === id);
        
        // If user not found, log and return false
        if (userIndex === -1) {
            return false;
        }

        //Keep reference to deleted user for logging
        const deletedUser = this.users[userIndex];
        
        // Remove the user from the array using splice
        this.users.splice(userIndex, 1);

        // Return true to indicate successful deletion
        return true;
    }
    
    // Get total number of users
    getUserCount(): number {
        return this.users.length;
    }

    // Check if a user exists without returning the user data
    userExists(id: number): boolean {
        return this.users.some(user => user.id === id);
    }
}