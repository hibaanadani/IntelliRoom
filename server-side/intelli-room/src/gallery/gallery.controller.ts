import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Gallery } from './entities/gallery.entity';
import { AdminGuard } from 'src/auth/admin.guard';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @ApiOperation({ summary: 'Create a new gallery item' })
  @ApiCreatedResponse({
    type: Gallery,
    description: 'Gallery item created successfully',
  })
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() createGalleryDto: CreateGalleryDto): Promise<Gallery> {
    return this.galleryService.create(createGalleryDto);
  }

  @ApiOperation({ summary: 'Get all gallery items' })
  @ApiOkResponse({
    type: Gallery,
    isArray: true,
    description: 'List of all gallery items',
  })
  @Get()
  async findAll(): Promise<Gallery[]> {
    return this.galleryService.findAll();
  }

  @ApiOperation({ summary: 'Get a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery item ID' })
  @ApiOkResponse({
    type: Gallery,
    description: 'Gallery item found successfully',
  })
  @ApiNotFoundResponse({ description: 'Gallery item not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Gallery> {
    return this.galleryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery item ID' })
  @ApiOkResponse({
    type: Gallery,
    description: 'Gallery item updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Gallery item not found' })
  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ): Promise<Gallery> {
    return this.galleryService.update(id, updateGalleryDto);
  }

  @ApiOperation({ summary: 'Delete a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery item ID' })
  @ApiOkResponse({ description: 'Gallery item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Gallery item not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.galleryService.remove(id);
  }
}
