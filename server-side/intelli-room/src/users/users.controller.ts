import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { AdminGuard } from 'src/auth/admin.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: 'List of all users',
  })
  @UseGuards(AdminGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Search users by name' })
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: 'Users matching the name',
  })
  @ApiNotFoundResponse({
    description: 'No users found with the specified name',
  })
  @ApiQuery({ name: 'name', required: true, description: 'Name to search for' })
  @UseGuards(AdminGuard)
  @Get('search')
  async findByName(@Query('name') name: string): Promise<User[]> {
    return this.usersService.findByName(name);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'User found successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: User, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (ObjectId)', type: 'string' })
  @ApiOkResponse({ type: User, description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async removeUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.removeUser(id);
  }
}
