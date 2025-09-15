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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

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
