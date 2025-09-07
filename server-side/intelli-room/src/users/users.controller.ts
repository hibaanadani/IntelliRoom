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
  // We use dependency injection to get an instance of the UsersService.
  // This allows us to use the service's methods.
  // Added 'readonly' - prevents accidental reassignment of the service
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  // This endpoint gets all users. Simple.
  //@ApiOperation provides better documentation in Swagger UI
  @ApiOperation({ summary: 'Get all users' })
  //More descriptive response documentation
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: 'List of all users',
  })
  @Get()
  async getUsers(): Promise<User[]> {
    // We delegate the request to the service layer.
    return this.usersService.findAll();
  }

  // GET /users/search?name=...
  // This endpoint lets us find users by their name.
  // We can have multiple query params, so here we will specify.
  // ApiQuery makes entering the name non optional.
  // ApiNotFound returns 404 not found error.
  // Added ApiOperation for better Swagger docs.
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
    // We pass the query parameter to the service. Any `NotFoundException` from the service
    // will be automatically handled by NestJS, resulting in a 404 response.
    return this.usersService.findByName(name);
  }

  // GET /users/:id
  // This endpoint gets a single user by their ID.
  // : marks the id as a dynamic value URL parameter.
  // parse the id from the URL and provide it to the service.
  // param 1 to many, specify id and give it name id and type string.
  // Added ApiOperation for better documentation.
  @ApiOperation({ summary: 'Get user by ID' })
  // @ApiParam documents the path parameter in Swagger.
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'User found successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    // The `ParseIntPipe` ensures the ID from the URL is a valid number.
    // We call the service method, which will handle the case where the user is not found.
    return this.usersService.findById(id);
  }

  // POST /users
  // This endpoint creates a new user.
  // The request body is parsed automatically.
  // On post, it responds to 201 with type user.
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ type: User, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    // We pass the request body data to the service for creation and validation.
    return this.usersService.createUser(createUserDto);
  }

  // PATCH /users/:id
  // This endpoint updates an existing user.
  // @ApiOperation provides endpoint description in Swagger.
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // We call the service to update the user with the provided ID and data.
    return this.usersService.updateUser(id, updateUserDto);
  }

  // DELETE /users/:id
  // This endpoint deletes a user.
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
    // We delegate the deletion process to the service.
    await this.usersService.removeUser(id);
  }
}
