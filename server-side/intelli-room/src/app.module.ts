import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { RoomsModule } from './rooms/rooms.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { MlModelModule } from './ml-model/ml-model.module';
import { GalleryModule } from './gallery/gallery.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Gallery } from './gallery/entities/gallery.entity';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_DATABASE_URI,
      synchronize: true,
      entities: [User, Gallery],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'gallery'),
      serveRoot: '/uploads/gallery',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    RoomsModule,
    AiAgentModule,
    MlModelModule,
    GalleryModule,
    ChatbotModule,
  ],
})
export class AppModule {}
