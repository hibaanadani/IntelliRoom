import { Test, TestingModule } from '@nestjs/testing';
import { MlModelService } from './ml-model.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

const mockHttpService = {
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('MlModelService', () => {
  let service: MlModelService;
  let httpService: HttpService;

  const mlApiUrl = 'http://test.ml-api.com';
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test image data'),
    stream: Readable.from(Buffer.from('test image data')),
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'ML_API_URL') return mlApiUrl;
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MlModelService,
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

    service = module.get<MlModelService>(MlModelService);

    (service as any).mlApiUrl = mlApiUrl;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should throw an error if ML_API_URL is not defined', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);
      const testService = new MlModelService(
        mockHttpService as any,
        mockConfigService as any,
      );
      await expect(testService.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('analyzeRoom', () => {
    it('should successfully upload a file and return analysis', async () => {
      const mockResponse = {
        data: { analysis: 'living room', confidence: 0.95 },
      };
      jest
        .spyOn(mockHttpService, 'post')
        .mockReturnValue(of(mockResponse as any));

      const result = await service.analyzeRoom(mockFile);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${mlApiUrl}/analyze`,
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw InternalServerErrorException on a failed API call', async () => {
      const mockError = new AxiosError('Service Unavailable', '503');
      mockError.response = { status: 503, data: 'Service Unavailable' } as any;
      jest
        .spyOn(mockHttpService, 'post')
        .mockReturnValue(throwError(() => mockError));

      await expect(service.analyzeRoom(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockHttpService.post).toHaveBeenCalled();
    });
  });
});
