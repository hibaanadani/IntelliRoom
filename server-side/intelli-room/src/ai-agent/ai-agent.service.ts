import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FrontendBookingDto, GetTimesDto } from './dto/ai-agent.dto';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AiAgentService implements OnModuleInit {
  private readonly logger = new Logger(AiAgentService.name);

  private n8nBookingWebhookUrl: string | undefined;
  private n8nAvailableTimesWebhookUrl: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.n8nBookingWebhookUrl = this.configService.get<string>(
      'N8N_WEBHOOK_URL_Calendar',
    );
    this.n8nAvailableTimesWebhookUrl = this.configService.get<string>(
      'N8N_WEBHOOK_URL_Availabile',
    );

    if (!this.n8nBookingWebhookUrl) {
      this.logger.error(
        'N8N_WEBHOOK_URL_Calendar is not defined. Cannot process bookings.',
      );
      throw new InternalServerErrorException(
        'N8N booking URL is not configured.',
      );
    }

    if (!this.n8nAvailableTimesWebhookUrl) {
      this.logger.error(
        'N8N_WEBHOOK_URL_Availabile is not defined. Cannot get available times.',
      );
      throw new InternalServerErrorException(
        'N8N available times URL is not configured.',
      );
    }
  }

  async processBooking(bookingData: FrontendBookingDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.n8nBookingWebhookUrl!, bookingData).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Failed to send data to n8n. Status: ${error.response?.status}, Message: ${error.message}`,
              error.stack,
            );
            throw new BadRequestException(
              'Request could not be processed due to an external error.',
            );
          }),
        ),
      );
      this.logger.log(
        `Booking request forwarded to n8n: ${JSON.stringify(response.data)}`,
      );
      return {
        message: 'Booking request acknowledged and forwarded to n8n.',
        n8nResponse: response.data,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send data to n8n. Status: ${error.response?.status}, Message: ${error.message}`,
      );
      throw new BadRequestException(
        'Request could not be processed due to an external error.',
      );
    }
  }

  async getAvailableTimes(dateData: GetTimesDto): Promise<string[]> {
    try {
      const { date } = dateData;
      const url = `${this.n8nAvailableTimesWebhookUrl!}?action=get_available_times&date=${date}`;

      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Failed to get times from n8n. Status: ${error.response?.status}, Message: ${error.message}`,
              error.stack,
            );
            throw new BadRequestException('Could not retrieve times from n8n.');
          }),
        ),
      );

      this.logger.log(
        `Available times received from n8n: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get times from n8n. Status: ${error.response?.status}, Message: ${error.message}`,
      );
      throw new BadRequestException('Could not retrieve times from n8n.');
    }
  }
}
