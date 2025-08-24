import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    NotFoundException, 
    Param, 
    ParseIntPipe, 
    Patch, 
    Post, 
    Query,
    HttpCode,        // NEW: Allows us to set specific HTTP status codes
    HttpStatus       // NEW: Enum with standard HTTP status codes
} from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { 
    ApiCreatedResponse, 
    ApiNotFoundResponse, 
    ApiOkResponse, 
    ApiQuery, 
    ApiTags,
    ApiOperation,    // NEW: Adds description to each endpoint in Swagger
    ApiParam         // NEW: Documents path parameters in Swagger
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    // nest js utilizing dependancy injection and instantiate classes and manage reference to those classes
    // IMPROVED: Added 'readonly' - prevents accidental reassignment of the service
    constructor(private readonly usersService: UsersService) {}

    //@ApiOperation provides better documentation in Swagger UI
    @ApiOperation({ summary: 'Get all users' })
    //More descriptive response documentation
    @ApiOkResponse({ type: User, isArray: true, description: 'List of all users' })
    @Get()
    getUsers(): User[] {
        return this.usersService.findAll();
    }

    // get user by querying over, search by id, name...
    // you can have multiple query params, so here we will specify
    // ApiQuery makes entering the name non optional
    // ApiNotFound returns 404 not found error
    // Added ApiOperation for better Swagger docs
    @ApiOperation({ summary: 'Search users by name' })
    @ApiOkResponse({ type: User, isArray: true, description: 'Users matching the name' })
    @ApiNotFoundResponse({ description: 'No users found with the specified name' })
    @ApiQuery({ name: 'name', required: true, description: 'Name to search for' })
    @Get('search')
    getUsersByName(@Query('name') name: string): User[] {
        const users = this.usersService.findByName(name);

        if (users.length === 0) {
            throw new NotFoundException(`No users found with name: ${name}`);
        }
        return users;
    }

    // : marks the id as dynamic value URL parameter
    // parse the id from the URL and provide it to the service
    // param 1 to many, specify id and give it name id and type string
    // Added ApiOperation for better documentation
    @ApiOperation({ summary: 'Get user by ID' })
    // @ApiParam documents the path parameter in Swagger
    @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
    @ApiOkResponse({ type: User, description: 'User found successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number): User { // Nest already parses to int, using ParseIntPipe
        const user = this.usersService.findById(id); // so here we can get rid of Number(id)
        
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        
        return user;
    }

    // body parser
    // on post it responds to 201 with type user
    @ApiOperation({ summary: 'Create a new user' })
    @ApiCreatedResponse({ type: User, description: 'User created successfully' })
    @Post()
    createUser(@Body() createUserDto: createUserDto): User {
        return this.usersService.createUser(createUserDto);
    }

    // @ApiOperation provides endpoint description in Swagger
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
    @ApiOkResponse({ type: User, description: 'User updated successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Patch(':id')
    updateUser(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateUserDto: updateUserDto
    ): User {
        const updatedUser = this.usersService.updateUser(id, updateUserDto);
        
        if (!updatedUser) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        
        return updatedUser;
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
    removeUser(@Param('id', ParseIntPipe) id: number): void {
        const isDeleted = this.usersService.removeUser(id);
        
        // Check if user was found and deleted
        if (!isDeleted) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        // No return statement needed for void - just successful deletion
    }
}