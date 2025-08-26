// src/mongodb/mongodb.module.ts

// This module handles connecting to the MongoDB database.
// It is now updated to get environment variables using the exact names from your .env file.

import { Module, Inject } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

// This is like a "name tag" for our database connection
// Other parts of our app will use this name to get the database
const MONGO_DB = 'MONGO_DB';

@Module({
  // We need to import the ConfigModule here to use ConfigService,
  // even if it is global. This is good practice to explicitly state
  // module dependencies.
  imports: [ConfigModule],
  
  providers: [
    {
      // Step 1: Tell NestJS "when someone asks for MONGO_DB, give them this"
      provide: MONGO_DB,
      
      // Step 2: This factory function now injects the ConfigService
      // This ensures the service is available to get the .env variables.
      useFactory: async (configService: ConfigService): Promise<Db> => {
        
        // Step 3: Use the ConfigService to safely get the correct MONGODB_DATABASE_URI.
        // The .get() method returns the value, or undefined if not found.
        const mongoUrl = configService.get<string>('MONGODB_DATABASE_URI');
        
        // Step 4: Add a critical check to ensure the URL exists.
        if (!mongoUrl) {
          throw new Error('MONGODB_DATABASE_URI environment variable is not set. Please check your .env file.');
        }

        try {
          // Step 5: Create a new MongoDB client and connect
          const client = new MongoClient(mongoUrl);
          await client.connect();
          
          // Step 6: Get the database name from the ConfigService as well, using the correct key MONGODB_DB
          const dbName = configService.get<string>('MONGODB_DB');
          if (!dbName) {
            throw new Error('MONGODB_DB environment variable is not set. Please check your .env file.');
          }

          // Step 7: Connect to the specific database
          const database = client.db(dbName);
          await database.admin().ping();
          
          // Step 8: Return the database instance for other parts of the app to use
          return database;
          
        } catch (error) {
          throw error;
        }
      },
      // This is crucial: we tell the provider to inject the ConfigService.
      inject: [ConfigService],
    },
  ],
  
  // Step 9: Export MONGO_DB so other modules can use it
  exports: [MONGO_DB],
})
export class MongodbModule {}

// Export the token name so other files can import it
export { MONGO_DB };
