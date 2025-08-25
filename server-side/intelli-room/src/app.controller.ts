// This is the main controller - it handles basic app endpoints
// Controllers are like "traffic directors" that handle incoming HTTP requests

import { Controller, Get, Post, Request, UseGuards, Inject } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Db } from 'mongodb';
import { MONGO_DB } from './mongodb/mongodb.module';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication & Health') // Groups these endpoints in Swagger
@Controller()
export class AppController {
  // Inject the services we need
  constructor(
    private readonly authService: AuthService,  // For handling login
    @Inject(MONGO_DB) private readonly db: Db,   // For database health check
  ) {}

  // POST /login - This is where users log in with username and password
  @ApiOperation({ summary: 'Login with username and password' })
  @UseGuards(LocalAuthGuard)  // This guard checks username/password before running the function
  @Post('login')
  async login(@Request() req): Promise<any> {
    // If we get here, it means username/password were correct!
    // The LocalAuthGuard has already validated them and put user info in req.user
    
    // Create and return a JWT token for this user
    return this.authService.login(req.user);
  }

  // GET /protected - This is a protected endpoint that requires a JWT token
  @ApiOperation({ summary: 'Test endpoint that requires JWT token' })
  @UseGuards(JwtAuthGuard)  // This guard checks for valid JWT token
  @Get('protected')
  getProtectedData(@Request() req): any {
    // If we get here, it means the JWT token was valid!
    // The JwtAuthGuard has already validated the token and put user info in req.user
    
    return {
      message: 'Hello! You are authenticated!',
      user: req.user  // This contains the user data from the JWT token
    };
  }

  // GET /health/db - Check if our database connection is working
  @ApiOperation({ summary: 'Check database connection health' })
  @Get('health/db')
  async checkDatabaseHealth(): Promise<{ ok: number; message: string }> {
    try {
      // Try to ping the database
      const admin = this.db.admin();
      await admin.ping();
      
      return { 
        ok: 1, 
        message: 'Database connection is healthy!' 
      };
    } catch (error) {
      return { 
        ok: 0, 
        message: 'Database connection failed!' 
      };
    }
  }
}
