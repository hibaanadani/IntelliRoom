import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.startegy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports:[UsersModule, PassportModule, JwtModule.register({
        secret:'SECRET', //put in env
        signOptions:{expiresIn:'3600s'}
    })],
    providers:[AuthService, LocalStrategy ,JwtStrategy],
    exports:[AuthService]
})
export class AuthModule {}
