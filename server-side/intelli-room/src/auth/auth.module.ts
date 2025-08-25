import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.startegy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports:[
        UsersModule, 
        PassportModule, 
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-change-in-production',
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
            }),
            inject: [ConfigService],
        })
    ],
    providers:[AuthService, LocalStrategy ,JwtStrategy],
    exports:[AuthService]
})
export class AuthModule {}
