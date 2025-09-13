import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomDto } from './dto/room.dto';
import { ObjectId } from 'mongodb';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Reflector } from '@nestjs/core';
import { Readable } from 'stream';

const mockRoomsService = () => ({
  saveRoomWithImage: jest.fn(),
  getUserRooms: jest.fn(),
  deleteRoom: jest.fn(),
});

const mockRoom: RoomDto = {
  id: new ObjectId().toString(),
  name: 'Test Room',
  mlOutput: {
    overallClassification: 'Good',
    individualObjectAnalysis: [{ object: 'chair', classification: 'Good' }],
    actionableReport: ['No issues found.'],
  },
  imageUrl: 'http://example.com/uploads/test-image.jpg',
  createdAt: new Date(),
};

const mockUserObjectId = new ObjectId('60c72b2f9b1d8e001f8e1a1a').toString();

describe('RoomsController', () => {
  let controller: RoomsController;
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService(),
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveRoomWithImage', () => {
    const file: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test image data'),
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
    const roomData = JSON.stringify({ name: 'Living Room' });

    it('should call the service and return a new room', async () => {
      jest.spyOn(service, 'saveRoomWithImage').mockResolvedValue(mockRoom);
      const result = await controller.saveRoomWithImage(
        mockUserObjectId,
        file,
        roomData,
      );
      expect(service.saveRoomWithImage).toHaveBeenCalledWith(
        mockUserObjectId,
        roomData,
        file,
      );
      expect(result).toEqual(mockRoom);
    });

    it('should handle errors from the service', async () => {
      jest
        .spyOn(service, 'saveRoomWithImage')
        .mockRejectedValue(new BadRequestException('Invalid file'));
      await expect(
        controller.saveRoomWithImage(mockUserObjectId, file, roomData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserRooms', () => {
    it('should call the service and return a list of rooms', async () => {
      jest.spyOn(service, 'getUserRooms').mockResolvedValue([mockRoom]);
      const result = await controller.getUserRooms(mockUserObjectId);
      expect(service.getUserRooms).toHaveBeenCalledWith(mockUserObjectId);
      expect(result).toEqual([mockRoom]);
    });

    it('should handle NotFoundException from the service', async () => {
      jest
        .spyOn(service, 'getUserRooms')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(
        controller.getUserRooms('non-existent-user-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRoom', () => {
    it('should call the service and return a 204 status', async () => {
      jest.spyOn(service, 'deleteRoom').mockResolvedValue(undefined);
      const result = await controller.deleteRoom(mockUserObjectId, mockRoom.id);
      expect(service.deleteRoom).toHaveBeenCalledWith(
        mockUserObjectId,
        mockRoom.id,
      );
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundException from the service', async () => {
      jest
        .spyOn(service, 'deleteRoom')
        .mockRejectedValue(new NotFoundException('Room not found'));
      await expect(
        controller.deleteRoom(mockUserObjectId, 'non-existent-room-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
