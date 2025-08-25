// This is the Local Strategy - it handles username/password login
// When someone tries to login with username and password, this code runs

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable() // This makes it a NestJS service
export class LocalStrategy extends PassportStrategy(Strategy) {
    
    constructor(private authService: AuthService) {
        super(); // Use default configuration (expects 'username' and 'password' fields)
    }

    // This function is called when someone tries to login
    async validate(username: string, password: string): Promise<any> {
        // Step 1: Check if the username and password are correct
        const user = await this.authService.validateUser(username, password);

        // Step 2: If login failed, throw an error
        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Step 3: If login successful, return the user data
        // This gets attached to the request and passed to the login endpoint
        return user;
    }
}
