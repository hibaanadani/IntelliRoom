// This is the main module that brings everything together
// Think of it as the "main folder" that contains all other folders

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';      // Everything related to users
import { MongodbModule } from './mongodb/mongodb.module'; // Database connection
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';          // Everything related to authentication
import { AppConfigModule } from './config/config.module'; // Environment variables

@Module({
  // Import other modules (like importing other folders)
  imports: [
    AppConfigModule,  // For environment variables (.env file)
    UsersModule,      // For user-related endpoints (/users)
    MongodbModule,    // For database connection
    AuthModule,       // For authentication (login, JWT)
  ],
  
  // Controllers handle HTTP requests (like GET, POST, etc.)
  controllers: [AppController],
  
  // Services contain business logic
  // Note: AuthService is already provided in AuthModule, but keeping here for learning
  providers: [AppService, AuthService],
})
export class AppModule {}
