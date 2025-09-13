import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { FrontendBookingDto, GetTimesDto } from './dto/ai-agent.dto';

const mockAiAgentService = {
  processBooking: jest.fn(),
  getAvailableTimes: jest.fn(),
};

describe('AiAgentController', () => {
  let controller: AiAgentController;
  let service: AiAgentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAgentController],
      providers: [
        {
          provide: AiAgentService,
          useValue: mockAiAgentService,
        },
      ],
    }).compile();

    controller = module.get<AiAgentController>(AiAgentController);
    service = module.get<AiAgentService>(AiAgentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleBooking', () => {
    it('should call aiAgentService.processBooking with the correct data', async () => {
      const mockBookingData: FrontendBookingDto = {
        title: 'Weekly Team Sync',
        email: 'hiba_anadani@hotmail.com',
        fullname: 'hiba anadani',
        startTime: '2025-09-25T10:00:00.000Z',
        endTime: '2025-09-25T11:00:00.000Z',
        participants: ['hiba_anadani@hotmail.com'],
        notes: 'Discuss project progress.',
      };
      const expectedResult = { message: 'Booking processed' };
      mockAiAgentService.processBooking.mockResolvedValue(expectedResult);

      const result = await controller.handleBooking(mockBookingData);

      expect(service.processBooking).toHaveBeenCalledWith(mockBookingData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('handleGetTimes', () => {
    it('should call aiAgentService.getAvailableTimes with the correct query', async () => {
      const mockQuery: GetTimesDto = { date: '2025-10-20' };
      const expectedResult = ['10:00', '11:00'];
      mockAiAgentService.getAvailableTimes.mockResolvedValue(expectedResult);

      const result = await controller.handleGetTimes(mockQuery);

      expect(service.getAvailableTimes).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(expectedResult);
    });
  });
});
