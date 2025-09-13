import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { MongoRepository } from 'typeorm';
import { User, Room, MLOutput } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MlModelService } from 'src/ml-model/ml-model.service';
import { ObjectId } from 'mongodb';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
import { Readable } from 'stream';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
}));

const mockMongoRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  deleteOne: jest.fn(),
});

const mockMlOutput: MLOutput = {
  overallClassification: 'Good',
  individualObjectAnalysis: [
    { object: 'chair', classification: 'Good' },
    { object: 'table', classification: 'Good' },
  ],
  actionableReport: ['No issues found.'],
};

const mockCreateRoomDto: CreateRoomDto = {
  name: 'Test Room',
  mlOutput: mockMlOutput,
  imageUrl: 'http://example.com/uploads/test-image.jpg',
};

const mockRoom: Room = {
  id: new ObjectId().toString(),
  name: 'Test Room',
  mlOutput: mockMlOutput,
  imageUrl: 'http://example.com/uploads/test-image.jpg',
  createdAt: new Date(),
};

const mockUser: User = {
  _id: new ObjectId('60c72b2f9b1d8e001f8e1a1a'),
  id: 1,
  fullname: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword123',
  rooms: [mockRoom],
};

describe('RoomsService', () => {
  let service: RoomsService;
  let usersRepository: MongoRepository<User>;
  let mlModelService: MlModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockMongoRepository(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'API_BASE_URL') {
                return 'http://localhost:9000';
              }
              return null;
            }),
          },
        },
        {
          provide: MlModelService,
          useValue: {
            analyzeRoom: jest.fn().mockResolvedValue(mockMlOutput),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    usersRepository = module.get<MongoRepository<User>>(
      getRepositoryToken(User),
    );
    mlModelService = module.get<MlModelService>(MlModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      destination: './uploads',
      filename: 'test.jpg',
      path: './uploads/test.jpg',
    };

    it('should successfully save a new room with an image and return the new room DTO', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(usersRepository, 'save').mockResolvedValue({
        ...mockUser,
        rooms: [
          ...mockUser.rooms,
          { ...mockRoom, id: new ObjectId().toString() },
        ],
      } as any);

      const result = await service.saveRoomWithImage(
        mockUser.id.toString(),
        JSON.stringify(mockCreateRoomDto),
        file,
      );

      expect(mlModelService.analyzeRoom).toHaveBeenCalledWith(file);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();

      expect(result).toEqual(
        expect.objectContaining({
          name: mockCreateRoomDto.name,
          mlOutput: mockMlOutput,
          imageUrl: expect.stringContaining('http://localhost:9000/uploads/'),
        }),
      );
    });

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(
        service.saveRoomWithImage(
          mockUser.id.toString(),
          JSON.stringify(mockCreateRoomDto),
          null as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.saveRoomWithImage(
          '999',
          JSON.stringify(mockCreateRoomDto),
          file,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserRooms', () => {
    it('should return an array of rooms for a valid user ID', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      const rooms = await service.getUserRooms(mockUser.id.toString());
      expect(rooms).toEqual(mockUser.rooms);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.getUserRooms('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteRoom', () => {
    it('should successfully delete a room and return void', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(usersRepository, 'save').mockResolvedValue({
        ...mockUser,
        rooms: [],
      } as any);

      await expect(
        service.deleteRoom(mockUser.id.toString(), mockRoom.id),
      ).resolves.toBeUndefined();
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.deleteRoom('999', mockRoom.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if the room ID is not found for the user', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as any);
      await expect(
        service.deleteRoom(mockUser.id.toString(), 'non-existent-room-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
