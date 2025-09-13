import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentService } from './ai-agent.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

class FrontendBookingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class GetTimesDto {
  @IsString()
  @IsDateString()
  date: string;
}

const mockHttpService = {
  post: jest.fn(),
  get: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AiAgentService', () => {
  let service: AiAgentService;
  let httpService: HttpService;

  const bookingUrl = 'http://test.n8n.com/booking';
  const availableTimesUrl = 'http://test.n8n.com/available-times';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'N8N_WEBHOOK_URL_Calendar') return bookingUrl;
      if (key === 'N8N_WEBHOOK_URL_Availabile') return availableTimesUrl;
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAgentService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiAgentService>(AiAgentService);
    httpService = module.get<HttpService>(HttpService);
    (service as any).n8nBookingWebhookUrl = bookingUrl;
    (service as any).n8nAvailableTimesWebhookUrl = availableTimesUrl;
  });

  const createAxiosError = (status: number, message: string): AxiosError => {
    const error = new AxiosError(message, '400');
    error.response = {
      status,
      data: null,
      headers: {},
      statusText: '',
      config: {},
    } as AxiosResponse;
    return error;
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configuration validation in onModuleInit', () => {
    it('should throw an error if booking URL is not defined', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'N8N_WEBHOOK_URL_Calendar') return null;
        if (key === 'N8N_WEBHOOK_URL_Availabile') return availableTimesUrl;
        return null;
      });

      const service = new AiAgentService(
        mockHttpService as any,
        mockConfigService as any,
      );
      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw an error if available times URL is not defined', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'N8N_WEBHOOK_URL_Calendar') return bookingUrl;
        if (key === 'N8N_WEBHOOK_URL_Availabile') return null;
        return null;
      });

      const service = new AiAgentService(
        mockHttpService as any,
        mockConfigService as any,
      );
      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('processBooking', () => {
    const mockBookingData: FrontendBookingDto = {
      title: 'Weekly Team Sync',
      email: 'hiba_anadani@hotmail.com',
      fullname: 'hiba anadani',
      startTime: '2025-09-25T10:00:00.000Z',
      endTime: '2025-09-25T11:00:00.000Z',
      participants: ['hiba_anadani@hotmail.com'],
      notes: 'Discuss project progress.',
    };

    it('should successfully process a booking and return a success message', async () => {
      const mockResponse = { data: { message: 'Booking received.' } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse as any));

      const result = await service.processBooking(mockBookingData);

      expect(httpService.post).toHaveBeenCalledWith(
        bookingUrl,
        mockBookingData,
      );
      expect(result).toEqual({
        message: 'Booking request acknowledged and forwarded to n8n.',
        n8nResponse: mockResponse.data,
      });
    });

    it('should throw BadRequestException on a failed API call', async () => {
      const mockError = createAxiosError(400, 'Bad Request');
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => mockError));

      await expect(service.processBooking(mockBookingData)).rejects.toThrow(
        BadRequestException,
      );
      expect(httpService.post).toHaveBeenCalledWith(
        bookingUrl,
        mockBookingData,
      );
    });

    it('should throw BadRequestException on a general error', async () => {
      const mockError = new Error('Network error');
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => mockError));

      await expect(service.processBooking(mockBookingData)).rejects.toThrow(
        BadRequestException,
      );
      expect(httpService.post).toHaveBeenCalledWith(
        bookingUrl,
        mockBookingData,
      );
    });
  });

  describe('getAvailableTimes', () => {
    const mockDateData: GetTimesDto = { date: '2025-10-20' };

    it('should successfully get available times', async () => {
      const mockTimes = ['10:00', '11:00', '12:00'];
      const mockResponse = { data: mockTimes };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as any));

      const result = await service.getAvailableTimes(mockDateData);

      const expectedUrl = `${availableTimesUrl}?action=get_available_times&date=${mockDateData.date}`;
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockTimes);
    });

    it('should throw BadRequestException on a failed API call', async () => {
      const mockError = createAxiosError(404, 'Not Found');
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => mockError));

      await expect(service.getAvailableTimes(mockDateData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
