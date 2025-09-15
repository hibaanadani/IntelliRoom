import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  private chatbotWebhookUrl: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('CHATBOT_WEBHOOK_URL');
    if (!url) {
      throw new InternalServerErrorException(
        'CHATBOT_WEBHOOK_URL is not configured.',
      );
    }
    this.chatbotWebhookUrl = url;
  }

  async sendMessage(message: string, userId: string): Promise<any> {
    if (!message) {
      throw new BadRequestException('Message cannot be empty.');
    }

    try {
      const response = await axios.post(this.chatbotWebhookUrl, {
        message: message,
        userId: userId,
      });

      console.log('Response from n8n:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error connecting to chatbot workflow:', error.message);
      return {
        status: 'error',
        message: 'Could not connect to the chatbot service.',
      };
    }
  }
}
