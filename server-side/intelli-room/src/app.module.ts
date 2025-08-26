// This is the main module that brings everything together
// Think of it as the "main folder" that contains all other folders

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module'; // Everything related to users
import { MongodbModule } from './mongodb/mongodb.module'; // Database connection
import { AuthModule } from './auth/auth.module'; // Everything related to authentication
import { AppConfigModule } from './config/config.module'; // Environment variables

@Module({
  // Import other modules (like importing other folders)
  imports: [
    // This is the crucial change to fix the environment variable issue.
    // The AppConfigModule is now at the top of the imports list,
    // which ensures that environment variables are loaded first.
    AppConfigModule, 
    AuthModule,
    MongodbModule,
    UsersModule,
  ],
  
  // Controllers handle HTTP requests (like GET, POST, etc.)
  controllers: [AppController],
  
  // AppService is the only provider that belongs directly to the AppModule.
  // We've removed AuthService from here because it is provided and exported
  // by AuthModule, which is correctly imported above.
  providers: [AppService],
})
export class AppModule {}