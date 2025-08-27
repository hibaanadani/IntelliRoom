import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { MongodbModule } from 'src/mongodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService]
})
export class CatalogueModule {}
