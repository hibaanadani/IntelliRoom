import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfigService = {
  get: jest.fn(),
};

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockReturnValue('http://mock-url.com');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should throw an error if CHATBOT_WEBHOOK_URL is not configured', () => {
      let error: any;

      mockConfigService.get.mockReturnValueOnce(undefined);

      try {
        new ChatbotService(mockConfigService as any);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('sendMessage', () => {
    const userId = 'test-user-123';
    const message = 'Hello, chatbot!';
    const payload = { message, userId };

    it('should throw BadRequestException if message is empty', async () => {
      await expect(service.sendMessage('', userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully send a message and return the chatbot response', async () => {
      const mockResponse = {
        data: { status: 'success', response: 'Hello from the chatbot!' },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.sendMessage(message, userId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://mock-url.com',
        payload,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return a custom error object on a failed API call', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(mockError);

      const result = await service.sendMessage(message, userId);

      expect(result).toEqual({
        status: 'error',
        message: 'Could not connect to the chatbot service.',
      });
    });
  });
});
