import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

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
  @Get()
  async getUsers(): Promise<User[]> {
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
  @Get('search')
  async getUsersByName(@Query('name') name: string): Promise<User[]> {
    return this.usersService.findByName(name);
  }

  // : marks the id as a dynamic value URL parameter.
  // parse the id from the URL and provide it to the service.
  // param 1 to many, specify id and give it name id and type string.
  // Added ApiOperation for better documentation.
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'User found successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    // The `ParseIntPipe` ensures the ID from the URL is a valid number.
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: User, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  // @HttpCode sets the response to 204 No Content (standard for successful DELETE)
  // Instead of 200 OK, 204 means "success but no content to return"
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  // void return type since we don't return any data for DELETE
  async removeUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.removeUser(id);
  }
}
