import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { FrontendBookingDto, GetTimesDto } from './dto/ai-agent.dto';

@Controller('ai-agent')
export class AiAgentController {
  private readonly logger = new Logger(AiAgentController.name);

  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('process-booking')
  @HttpCode(HttpStatus.OK)
  async handleBooking(@Body() bookingData: FrontendBookingDto): Promise<any> {
    this.logger.log('Received new booking request from frontend.');
    return this.aiAgentService.processBooking(bookingData);
  }

  @Post('get-times')
  @HttpCode(HttpStatus.OK)
  async handleGetTimes(@Body() dateData: GetTimesDto): Promise<any> {
    this.logger.log('Received a request for available times from frontend.');
    this.logger.log('Received dateData:', dateData);
    return this.aiAgentService.getAvailableTimes(dateData);
  }
}
