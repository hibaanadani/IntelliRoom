// This is the JWT Strategy - it tells Passport how to handle JWT tokens
// When someone sends a request with a JWT token, this code runs to check if it's valid

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    // Configure how JWT tokens should be handled
    super({
      // Where to find the JWT token in the request (in the "Authorization" header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't allow expired tokens
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'fallback-secret-change-in-production',
    });
  }

  // This function runs AFTER the JWT token is verified as valid
  // The "payload" contains the data we stored in the token when creating it
  // We expect the payload to have 'sub' and 'email' fields, as defined in AuthService
  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Return user info that will be attached to the request
    // We return the full user object (minus password) for convenience
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
