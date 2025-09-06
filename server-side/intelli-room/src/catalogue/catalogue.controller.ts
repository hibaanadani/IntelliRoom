import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { Catalogue } from './entities/catalogue.entity';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Catalogue')
@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @ApiOperation({ summary: 'Create a new catalogue entry' })
  @ApiCreatedResponse({
    type: Catalogue,
    description: 'Catalogue entry created successfully',
  })
  @Post()
  async createCatalogue(
    @Body() createCatalogueDto: CreateCatalogueDto,
  ): Promise<Catalogue> {
    return await this.catalogueService.createCatalogue(createCatalogueDto);
  }

  @ApiOperation({ summary: 'Get all catalogue entries' })
  @ApiOkResponse({
    type: Catalogue,
    isArray: true,
    description: 'List of all catalogue entries',
  })
  @Get()
  async getAllCatalogues(): Promise<Catalogue[]> {
    return await this.catalogueService.findAll();
  }

  @ApiOperation({ summary: 'Get a single catalogue entry by ID' })
  @ApiParam({ name: 'id', description: 'Catalogue ID', type: 'integer' })
  @ApiOkResponse({
    type: Catalogue,
    description: 'Catalogue entry found successfully',
  })
  @ApiNotFoundResponse({ description: 'Catalogue not found' })
  @Get(':id')
  async getCatalogueById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Catalogue> {
    return await this.catalogueService.findById(id);
  }

  @ApiOperation({ summary: 'Update a catalogue entry by ID' })
  @ApiParam({ name: 'id', description: 'Catalogue ID', type: 'integer' })
  @ApiOkResponse({
    type: Catalogue,
    description: 'Catalogue entry updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Catalogue not found' })
  @Put(':id')
  async updateCatalogue(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCatalogueDto: UpdateCatalogueDto,
  ): Promise<Catalogue> {
    return await this.catalogueService.updateCatalogue(id, updateCatalogueDto);
  }

  @ApiOperation({ summary: 'Delete a catalogue entry by ID' })
  @ApiParam({ name: 'id', description: 'Catalogue ID', type: 'integer' })
  @ApiOkResponse({ description: 'Catalogue deleted successfully' })
  @ApiNotFoundResponse({ description: 'Catalogue not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteCatalogue(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.catalogueService.deleteCatalogue(id);
  }
}
