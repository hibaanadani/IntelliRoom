import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { Catalogue } from './entities/catalogue.entity';
import { TypeOrmModule } from '@nestjs/typeorm'; 

@Module({
  imports: [TypeOrmModule.forFeature([Catalogue])], 
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService]
})
export class CatalogueModule {}
