// This controller handles authentication-related API endpoints.

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication & Health') // Grouping for Swagger documentation
@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // The @UseGuards(AuthGuard('local')) decorator triggers the LocalStrategy.
    // The @ApiBody decorator provides Swagger documentation for the request body.
    @ApiOperation({ summary: 'Login with username and password' })
    @ApiBody({ type: LoginDto })
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req: any, @Body() loginDto: LoginDto) {
        // The `req.user` object is automatically populated by the LocalStrategy's `validate` method.
        // It contains the user data that your validate method returns.
        return this.authService.login(req.user);
    }
}