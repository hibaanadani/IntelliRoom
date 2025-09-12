import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomDto } from './dto/room.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@ApiTags('Rooms')
@Controller('users/:userObjectId/rooms')
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Save a new room for a user with image upload' })
  @ApiParam({ name: 'userObjectId', description: 'User ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roomData: {
          type: 'string',
          format: 'json',
          description:
            'JSON string containing the room name and ML output. Example: {"name": "Living Room", "mlOutput": {...}}',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'The room image file',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: RoomDto,
    description: 'Room created and saved successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async saveRoomWithImage(
    @Param('userObjectId') userObjectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('roomData') roomData: string,
  ): Promise<RoomDto> {
    return this.roomsService.saveRoomWithImage(userObjectId, roomData, file);
  }

  @ApiOperation({ summary: 'Get all rooms for a user' })
  @ApiParam({ name: 'userObjectId', description: 'User ID', type: 'string' })
  @ApiOkResponse({
    type: [RoomDto],
    description: 'List of rooms for the specified user',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get()
  async getUserRooms(
    @Param('userObjectId') userObjectId: string,
  ): Promise<RoomDto[]> {
    return this.roomsService.getUserRooms(userObjectId);
  }

  @ApiOperation({ summary: 'Delete a room for a user' })
  @ApiParam({ name: 'userObjectId', description: 'User ID', type: 'string' })
  @ApiParam({ name: 'roomId', description: 'Room ID', type: 'string' })
  @ApiOkResponse({ description: 'Room deleted successfully' })
  @ApiNotFoundResponse({ description: 'User or room not found' })
  @Delete(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRoom(
    @Param('userObjectId') userObjectId: string,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    await this.roomsService.deleteRoom(userObjectId, roomId);
  }
}
