// src/ai-agent/ai-agent.service.ts

import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { FrontendBookingDto, GetTimesDto } from './dto/ai-agent.dto';
import { ConfigService } from '@nestjs/config';

// Define a type for the data we'll send to n8n to get available times
interface N8nGetTimesPayload {
  action: 'get_available_times';
  date: string;
}

@Injectable()
export class AiAgentService implements OnModuleInit {
  private readonly logger = new Logger(AiAgentService.name);

  // Single webhook URL for both actions
  private n8nWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const url = this.configService.get<string>('N8N_WEBHOOK_URL_Calendar');
    if (!url) {
      this.logger.error(
        'N8N_WEBHOOK_URL_Calendar is not defined in the environment!',
      );
      throw new Error(
        'Configuration error: N8N_WEBHOOK_URL_Calendar not found.',
      );
    }
    this.n8nWebhookUrl = url;
  }

  async processBooking(bookingData: FrontendBookingDto): Promise<any> {
    this.logger.log('Forwarding booking data to n8n webhook.');
    this.logger.debug(`Payload: ${JSON.stringify(bookingData)}`);

    try {
      const response = await lastValueFrom(
        // Send the booking data as is, as n8n will know how to handle it.
        this.httpService.post(this.n8nWebhookUrl, bookingData).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Failed to send data to n8n. Status: ${error.response?.status}, Message: ${error.message}`,
            );
            throw new BadRequestException(
              'Failed to process request with n8n.',
            );
          }),
        ),
      );

      this.logger.log('Data successfully forwarded to n8n.');
      return {
        message: 'Booking request acknowledged and forwarded to n8n.',
        n8nResponse: response.data,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        'An unexpected error occurred while processing the booking.',
        error.stack,
      );
      throw new BadRequestException('An internal server error occurred.');
    }
  }

  async getAvailableTimes(dateData: GetTimesDto): Promise<string[]> {
    this.logger.log(
      `Request for available times for date: ${dateData.date}. Forwarding to n8n webhook.`,
    );

    // Create a payload that explicitly tells n8n what to do.
    const n8nPayload: N8nGetTimesPayload = {
      action: 'get_available_times',
      date: dateData.date,
    };

    try {
      // Send a POST request with the action payload to the single n8n webhook URL.
      const response = await lastValueFrom(
        this.httpService.post<string[]>(this.n8nWebhookUrl, n8nPayload).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Failed to get times from n8n. Status: ${error.response?.status}, Message: ${error.message}`,
            );
            throw new BadRequestException(
              'Failed to fetch available times from n8n.',
            );
          }),
        ),
      );

      this.logger.log('Available times successfully received from n8n.');
      // The response from n8n should be the array of available times.
      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        'An unexpected error occurred while fetching available times.',
        error.stack,
      );
      throw new BadRequestException('An internal server error occurred.');
    }
  }
}
