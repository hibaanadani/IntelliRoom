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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { diskStorage } from 'multer';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async removeUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.removeUser(id);
  }

  @Post(':id/rooms/upload')
  @UseInterceptors(FileInterceptor('image', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        roomData: { type: 'string' },
      },
    },
  })
  async uploadRoom(
    @Param('id', ParseIntPipe) userId: number,
    @UploadedFile() image: Express.Multer.File,
    @Body('roomData') roomDataString: string,
  ) {
    return this.usersService.addRoomWithImage(userId, roomDataString, image);
  }

  @ApiOperation({ summary: 'Get all rooms for a specific user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiOkResponse({ type: User, description: 'Rooms retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id/rooms')
  async getUserRooms(@Param('id', ParseIntPipe) userId: number) {
    const user = await this.usersService.findByIdWithRooms(userId);
    return user.rooms;
  }

  @ApiOperation({ summary: 'Delete a room for a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer' })
  @ApiParam({ name: 'roomId', description: 'Room ID', type: 'string' })
  @ApiOkResponse({ description: 'Room deleted successfully' })
  @ApiNotFoundResponse({ description: 'User or room not found' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/rooms/:roomId')
  async deleteRoom(
    @Param('id', ParseIntPipe) userId: number,
    @Param('roomId') roomId: string,
    @Request() req: any,
  ) {
    console.log('DELETE REQUEST DETAILS:');
    console.log('URL User ID:', userId, 'Type:', typeof userId);
    console.log(
      'Authenticated User ID:',
      req.user.id,
      'Type:',
      typeof req.user.id,
    );
    console.log('Room ID:', roomId, 'Type:', typeof roomId);

    await this.usersService.removeRoom(userId, roomId, req.user.id);
    return { message: 'Room deleted successfully' };
  }
}
