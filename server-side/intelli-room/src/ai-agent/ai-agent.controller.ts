import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { FrontendBookingDto } from './dto/ai-agent.dto';

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
}
