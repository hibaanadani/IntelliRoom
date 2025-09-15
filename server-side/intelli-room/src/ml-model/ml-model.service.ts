import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class MlModelService implements OnModuleInit {
  private readonly logger = new Logger(MlModelService.name);
  private mlApiUrl: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const url = this.configService.get<string>('ML_API_URL');
    if (!url) {
      this.logger.error('ML_API_URL is not defined!');
      throw new InternalServerErrorException(
        'Configuration error: ML_API_URL not found.',
      );
    }
    this.mlApiUrl = url;
  }

  async analyzeRoom(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.mlApiUrl!}/analyze`, formData, {
            headers: {
              ...formData.getHeaders(),
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                'Error communicating with ML API:',
                error.response?.data || error.message,
              );
              throw new InternalServerErrorException(
                'Failed to get analysis from ML model.',
              );
            }),
          ),
      );
      return response.data;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(
        'An unexpected error occurred during ML model analysis.',
        error.stack,
      );
      throw new InternalServerErrorException(
        'An unexpected internal server error occurred.',
      );
    }
  }
}
