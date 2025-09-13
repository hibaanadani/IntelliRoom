import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication & Health')
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<any> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Test endpoint that requires JWT token' })
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedData(@Request() req): any {
    return {
      message: 'Hello! You are authenticated!',
      user: req.user,
    };
  }
}
