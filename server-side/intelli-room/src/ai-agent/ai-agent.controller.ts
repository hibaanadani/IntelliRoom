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
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('AI Agent')
@Controller('ai-agent')
@ApiExtraModels(FrontendBookingDto, GetTimesDto)
export class AiAgentController {
  private readonly logger = new Logger(AiAgentController.name);

  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('process-booking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process a booking request',
    description:
      'Sends a new booking request to the AI agent service for processing.',
  })
  @ApiBody({
    description: 'Booking data including title, email, name, and time slots.',
    schema: {
      $ref: getSchemaPath(FrontendBookingDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking successfully processed.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking data provided.',
  })
  async handleBooking(@Body() bookingData: FrontendBookingDto): Promise<any> {
    this.logger.log('Received new booking request from frontend.');
    return this.aiAgentService.processBooking(bookingData);
  }

  @Post('get-times')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available times for a specific date',
    description:
      'Requests available time slots from the AI agent for a given date.',
  })
  @ApiBody({
    description: 'Date for which to check availability.',
    schema: {
      $ref: getSchemaPath(GetTimesDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available times retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date data provided.',
  })
  async handleGetTimes(@Body() dateData: GetTimesDto): Promise<any> {
    this.logger.log('Received a request for available times from frontend.');
    this.logger.log('Received dateData:', dateData);
    return this.aiAgentService.getAvailableTimes(dateData);
  }
}
