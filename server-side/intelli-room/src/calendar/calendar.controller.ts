import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { MessageDto } from './dto/message.dto';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the calendar assistant' })
  @ApiBody({ type: MessageDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success response from n8n webhook',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The message was empty or invalid',
  })
  async postMessage(@Body() messageDto: MessageDto): Promise<any> {
    return this.calendarService.handleUserMessage(messageDto.message);
  }
}
