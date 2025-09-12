import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { Gallery } from './entities/gallery.entity';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

const galleryStorageOptions = {
  storage: diskStorage({
    destination: './uploads/gallery',
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return cb(null, `${randomName}-${file.originalname}`);
    },
  }),
};

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new gallery item with a catalogue and cover image',
  })
  @ApiResponse({
    status: 201,
    description: 'The gallery item has been successfully created.',
    type: Gallery,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new gallery item with files',
    type: CreateGalleryDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'catalogue', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ],
      galleryStorageOptions,
    ),
  )
  async create(
    @Body() createGalleryDto: CreateGalleryDto,
    @UploadedFiles()
    files: {
      catalogue?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ): Promise<Gallery> {
    const catalogueFile = files.catalogue ? files.catalogue[0] : null;
    const coverImageFile = files.coverImage ? files.coverImage[0] : null;

    const cataloguePath = catalogueFile
      ? `uploads/gallery/${catalogueFile.filename}`
      : null;
    const coverImagePath = coverImageFile
      ? `uploads/gallery/${coverImageFile.filename}`
      : null;

    return this.galleryService.create(
      createGalleryDto,
      cataloguePath,
      coverImagePath,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all gallery items' })
  @ApiResponse({
    status: 200,
    description: 'Return all gallery items.',
    type: [Gallery],
  })
  async findAll(): Promise<Gallery[]> {
    return this.galleryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return a single gallery item.',
    type: Gallery,
  })
  @ApiResponse({ status: 404, description: 'Gallery item not found.' })
  async findOne(@Param('id') id: string): Promise<Gallery> {
    return this.galleryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The gallery item has been successfully updated.',
    type: Gallery,
  })
  @ApiResponse({ status: 404, description: 'Gallery item not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ): Promise<Gallery> {
    return this.galleryService.update(id, updateGalleryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'The gallery item has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Gallery item not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.galleryService.remove(id);
  }

  @Patch(':id/catalogue')
  @ApiOperation({ summary: 'Update the catalogue of a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        catalogue: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The catalogue has been successfully updated.',
    type: Gallery,
  })
  @ApiResponse({ status: 404, description: 'Gallery item not found.' })
  @UseInterceptors(FileInterceptor('catalogue', galleryStorageOptions))
  async updateCatalogue(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Gallery> {
    const cataloguePath = file ? `uploads/gallery/${file.filename}` : null;
    return this.galleryService.updateCatalogue(id, cataloguePath);
  }

  @Patch(':id/cover-image')
  @ApiOperation({ summary: 'Update the cover image of a gallery item by ID' })
  @ApiParam({ name: 'id', description: 'Gallery ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coverImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The cover image has been successfully updated.',
    type: Gallery,
  })
  @ApiResponse({ status: 404, description: 'Gallery item not found.' })
  @UseInterceptors(FileInterceptor('coverImage', galleryStorageOptions))
  async updateCoverImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Gallery> {
    const coverImagePath = file ? `uploads/gallery/${file.filename}` : null;
    return this.galleryService.updateCoverImage(id, coverImagePath);
  }
}
