import { Controller, Get, Post, Request, UseGuards, Inject } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Db } from 'mongodb';
import { MONGO_DB } from './mongodb/mongodb.module';

@Controller()
export class AppController {
  // Inject AuthService for login and the shared Mongo Db for health check
  constructor(
    private readonly authService: AuthService,
    @Inject(MONGO_DB) private readonly db: Db,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  // when a user logs in and everything is valid, the user returned ends up as a request object
  // so to utilize 
  login(@Request() req):any{
    return this.authService.login(req.user); //return jwt access token
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getHello(@Request() req): string { //require a bearer token, and validate it
    return req.user;
  }

  @Get('health/db')
  async dbHealth(): Promise<{ ok: number }> {
    // Simple ping to confirm the app can talk to MongoDB
    const admin = this.db.admin();
    await admin.ping();
    return { ok: 1 };
  }
}
