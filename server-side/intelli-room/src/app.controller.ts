import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  // when a user logs in and everything is valid, the user returned ends up as a request object
  // so to utilize 
  login(@Request() req):any{
    return req.user;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
