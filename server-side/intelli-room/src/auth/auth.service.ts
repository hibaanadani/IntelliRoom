// This service handles user authentication (login/logout)
// It checks if username and password are correct

import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    // Inject the services we need
    constructor(
        private usersService: UsersService,  // To find users in database
        private jwtService: JwtService        // To create JWT tokens
    ) {}

    // // This function checks if a user's login credentials are correct
    // async validateUser(username: string, password: string): Promise<any> {
    //     // Step 1: Find the user by username in the database
    //     const user = await this.usersService.findByUserName(username);

    //     // Step 2: Check if user exists and password is correct
    //     if (user && await bcrypt.compare(password, user.password)) {
    //         // Step 3: If login is successful, remove password from response
    //         // We don't want to send the password back to the client!
    //         const { password: userPassword, ...userWithoutPassword } = user;
    //         return userWithoutPassword;
    //     }

    //     // Step 4: If username not found or password wrong, return null
    //     return null;
    // }

    // This function creates a JWT token when user logs in successfully
    async login(user: any) {
        // Step 1: Create the "payload" (data to store in the token)
        const payload = {
            name: user.name,  // User's name
            sub: user.id      // User's ID ("sub" is standard JWT field)
        };

        // Step 2: Create and return the JWT token
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        };
    }
}
