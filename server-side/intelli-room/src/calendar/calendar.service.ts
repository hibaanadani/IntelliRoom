import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CalendarService {
  private n8nWebhookUrl: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('N8N_WEBHOOK_URL_Calendar');
    if (!url) {
      throw new InternalServerErrorException(
        'N8N_WEBHOOK_URL_Calendar is not configured.',
      );
    }
    this.n8nWebhookUrl = url;
  }

  async handleUserMessage(message: string): Promise<any> {
    if (!message) {
      throw new BadRequestException('Message cannot be empty.');
    }

    try {
      const response = await axios.post(this.n8nWebhookUrl, {
        message: message,
      });

      return response.data;
    } catch (error) {
      console.error('Error connecting to n8n workflow:', error.message);
      return {
        status: 'error',
        message: 'Could not connect to the calendar service.',
      };
    }
  }
}
