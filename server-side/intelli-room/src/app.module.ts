import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatalogueModule } from './catalogue/catalogue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Catalogue } from './catalogue/entities/catalogue.entity';
import { User } from './users/entities/user.entity';
import { GalleryModule } from './gallery/gallery.module';
import { Gallery } from './gallery/entities/gallery.entity';
import { CalendarModule } from './calendar/calendar.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_DATABASE_URI');

        if (!uri) {
          throw new Error(
            'MONGODB_DATABASE_URI environment variable is not set.',
          );
        }

        return {
          type: 'mongodb',
          url: `${uri}?authSource=admin`,
          synchronize: true,
          entities: [Catalogue, User, Gallery],
          useNewUrlParser: true,
          ssl: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CatalogueModule,
    GalleryModule,
    CalendarModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  // AppService is the only provider that belongs directly to the AppModule.
  providers: [AppService],
})
export class AppModule {}
