import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { MessageDto } from './dto/message.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockChatbotService = {
  sendMessage: jest.fn(),
};

describe('ChatbotController', () => {
  let controller: ChatbotController;
  let service: ChatbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        {
          provide: ChatbotService,
          useValue: mockChatbotService,
        },
      ],
    }).compile();

    controller = module.get<ChatbotController>(ChatbotController);
    service = module.get<ChatbotService>(ChatbotService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('postMessage', () => {
    const messageDto: MessageDto = {
      userId: 'test-user-123',
      message: 'Hello, I need help.',
    };
    const mockServiceResponse = {
      status: 'success',
      response: 'Hello from the chatbot!',
    };

    it('should call sendMessage with the correct arguments and return the service response', async () => {
      jest.spyOn(service, 'sendMessage').mockResolvedValue(mockServiceResponse);

      const result = await controller.postMessage(messageDto);

      expect(service.sendMessage).toHaveBeenCalledWith(
        messageDto.message,
        messageDto.userId,
      );

      expect(result).toEqual(mockServiceResponse);
    });

    it('should propagate BadRequestException thrown by the service', async () => {
      jest
        .spyOn(service, 'sendMessage')
        .mockRejectedValue(new BadRequestException('Message cannot be empty.'));

      await expect(controller.postMessage(messageDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should propagate InternalServerErrorException thrown by the service', async () => {
      jest
        .spyOn(service, 'sendMessage')
        .mockRejectedValue(
          new InternalServerErrorException('Could not connect to the service.'),
        );

      await expect(controller.postMessage(messageDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
