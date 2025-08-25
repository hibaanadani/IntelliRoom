// This module handles connecting to MongoDB database
// Think of it as the "bridge" between your NestJS app and your MongoDB database

import { Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

// This is like a "name tag" for our database connection
// Other parts of our app will use this name to get the database
const MONGO_DB = 'MONGO_DB';

@Module({
  providers: [
    {
      // Step 1: Tell NestJS "when someone asks for MONGO_DB, give them this"
      provide: MONGO_DB,
      
      // Step 2: This function creates the actual database connection
      useFactory: async (): Promise<Db> => {
        
        // Step 3: Get connection details from environment variables
        // These come from your .env file or Docker environment
        const host = process.env.MONGODB_DATABASE_HOST || 'localhost';
        const username = process.env.MONGODB_USERNAME || 'admin';
        const password = process.env.MONGODB_PASSWORD || 'password';
        const dbName = process.env.MONGODB_DB || 'intelliroom';
        
        // Step 4: Build the MongoDB connection string (URL)
        // This tells MongoDB where to connect and how to authenticate
        const mongoUrl = `mongodb://${username}:${password}@${host}:27017/${dbName}?authSource=admin`;
        
        try {
          // Step 5: Create a new MongoDB client and connect
          const client = new MongoClient(mongoUrl);
          await client.connect();
          
          // Step 6: Test the connection by pinging the database
          const database = client.db(dbName);
          await database.admin().ping();
          
          // Step 7: Return the database instance for other parts of the app to use
          return database;
          
        } catch (error) {
          throw error;
        }
      },
    },
  ],
  
  // Step 8: Export MONGO_DB so other modules can use it
  // This makes the database available to UserModule, AuthModule, etc.
  exports: [MONGO_DB],
})
export class MongodbModule {}

// Export the token name so other files can import it
export { MONGO_DB };

 