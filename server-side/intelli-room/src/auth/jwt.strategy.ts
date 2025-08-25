// This is the JWT Strategy - it tells Passport how to handle JWT tokens
// When someone sends a request with a JWT token, this code runs to check if it's valid

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { ConfigService } from '@nestjs/config';

@Injectable() // This makes it a NestJS service
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        private readonly usersService: UsersService,  // To look up users
        private readonly configService: ConfigService  // To get environment variables
    ) {
        // Configure how JWT tokens should be handled
        super({
            // Where to find the JWT token in the request (in the "Authorization" header)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            
            // Don't allow expired tokens
            ignoreExpiration: false,
            
            // The secret key to verify the token (same one used to create it)
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-change-in-production'
        });
    }
    
    // This function runs AFTER the JWT token is verified as valid
    // The "payload" contains the data we stored in the token when creating it
    async validate(payload: any) {
        // Get the full user info from database using the ID from the token
        const user = await this.usersService.findById(payload.sub);
        
        // Return user info that will be attached to the request
        // This is what you get in controllers when you use @Request() req
        return {
            id: payload.sub,
            name: payload.name,
            email: user?.email,
            username: user?.username
        };
    }
}
