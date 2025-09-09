import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { MessageDto } from '../chatbot/dto/message.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the interior design chatbot' })
  @ApiBody({ type: MessageDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success response from n8n chatbot',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The message was empty or invalid',
  })
  async postMessage(@Body() messageDto: MessageDto): Promise<any> {
    // Pass both the message and userId to the service
    return this.chatbotService.sendMessage(
      messageDto.message,
      messageDto.userId,
    );
  }
}
