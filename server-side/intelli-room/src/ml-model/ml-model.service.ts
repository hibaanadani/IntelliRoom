import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MlModelService {
  private readonly mlApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.mlApiUrl = this.configService.get<string>('ML_API_URL')!;
  }

  async analyzeRoom(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlApiUrl}/analyze`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error communicating with ML API:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to get analysis from ML model.',
      );
    }
  }
}
