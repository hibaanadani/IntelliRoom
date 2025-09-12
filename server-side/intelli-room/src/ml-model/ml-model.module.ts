import { Module } from '@nestjs/common';
import { MlModelService } from './ml-model.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MlModelService],
  exports: [MlModelService],
})
export class MlModelModule {}
