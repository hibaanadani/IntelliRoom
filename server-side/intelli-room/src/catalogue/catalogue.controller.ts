import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { Catalogue } from './entities/catalogue.entity';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Post()
  createCatalogue(@Body() createCatalogueDto: CreateCatalogueDto): Catalogue {
    return this.catalogueService.createCatalogue(createCatalogueDto);
  }

  @Get()
  getAllCatalogues(): Catalogue[] {
    return this.catalogueService.getAllCatalogues();
  }

  @Get(':id')
  getCatalogueById(@Param('id') id: string): Catalogue {
    return this.catalogueService.getCatalogueById(+id);
  }

  @Put(':id')
  updateCatalogue(@Param('id') id: string, @Body() updateCatalogueDto: UpdateCatalogueDto): Catalogue {
    return this.catalogueService.updateCatalogue(+id, updateCatalogueDto);
  }
  
  @Delete(':id')
  deleteCatalogue(@Param('id') id: string): void {
    this.catalogueService.deleteCatalogue(+id);
  }
}