import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
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

  // async login(loginDto: LoginDto) {
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
    };

    return {
      access_token: this.jwtService.sign(payload), //just send the access token and decode it in the frontend
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        age: user.age,
        phone: user.phone,
      },
    };
    //   const user = await this.usersService.findByEmail(loginDto.email);
    //   if (!user) {
    //     throw new NotFoundException('user not found');
    //   }
    //   if (await this.validateUser(loginDto.email, loginDto.password)) {
    //     const payload = {
    //       id: user._id,
    //       fullname: user.fullname,
    //       email: user.email,
    //       age: user.age,
    //       phone: user.phone,
    //     };
    //     return this.jwtService.sign(payload);
    //   }
    //   throw new UnauthorizedException('invalid password');
  }

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(newUser);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
