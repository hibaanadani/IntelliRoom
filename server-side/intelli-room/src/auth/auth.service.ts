import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: userPassword, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  async login(user: any) {
    const id = user.id;

    if (!id || !user.email) {
      throw new UnauthorizedException('Invalid user object for login.');
    }

    const fullname = user.fullname || '';

    const payload = {
      email: user.email,
      sub: id.toString(),
    };

    try {
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: id,
          fullname: fullname,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('JWT sign failed:', error);
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  async signup(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.createUser(createUserDto);
    return this.login(newUser);
  }
}
