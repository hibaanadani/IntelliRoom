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

interface N8nGetTimesPayload {
  action: 'get_available_times';
  date: string;
}

@Injectable()
export class AiAgentService implements OnModuleInit {
  private readonly logger = new Logger(AiAgentService.name);

  private n8nBookingWebhookUrl: string;
  private n8nAvailableTimesWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const bookingUrl = this.configService.get<string>(
      'N8N_WEBHOOK_URL_Calendar',
    );
    if (!bookingUrl) {
      this.logger.error('N8N_WEBHOOK_URL_Calendar is not defined!');
      throw new Error(
        'Configuration error: N8N_WEBHOOK_URL_Calendar not found.',
      );
    }
    this.n8nBookingWebhookUrl = bookingUrl;

    const availableTimesUrl = this.configService.get<string>(
      'N8N_WEBHOOK_URL_Availabile',
    );
    if (!availableTimesUrl) {
      this.logger.error('N8N_WEBHOOK_URL_Availabile is not defined!');
      throw new Error(
        'Configuration error: N8N_WEBHOOK_URL_Availabile not found.',
      );
    }
    this.n8nAvailableTimesWebhookUrl = availableTimesUrl;

    this.logger.log(
      `Initialized with N8N_WEBHOOK_URL_Availabile: ${this.n8nAvailableTimesWebhookUrl}`,
    );
  }

  async processBooking(bookingData: FrontendBookingDto): Promise<any> {
    this.logger.log('Forwarding booking data to n8n webhook.');
    this.logger.debug(`Payload: ${JSON.stringify(bookingData)}`);

    try {
      const response = await lastValueFrom(
        this.httpService.post(this.n8nBookingWebhookUrl, bookingData).pipe(
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

  async getAvailableTimes(dateData: GetTimesDto): Promise<any> {
    this.logger.log(
      `Request for available times for date: ${dateData.date}. Forwarding to n8n webhook.`,
    );
    this.logger.log(
      `Using n8n webhook URL: ${this.n8nAvailableTimesWebhookUrl}`,
    );

    const urlWithQuery = `${this.n8nAvailableTimesWebhookUrl}?action=get_available_times&date=${dateData.date}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(urlWithQuery).pipe(
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
