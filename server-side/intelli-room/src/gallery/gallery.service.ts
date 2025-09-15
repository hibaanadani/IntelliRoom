import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: MongoRepository<Gallery>,
  ) {}

  private async findGalleryItemById(id: string): Promise<Gallery> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format.`);
    }
    const galleryItem = await this.galleryRepository.findOneBy({
      _id: new ObjectId(id),
    });
    if (!galleryItem) {
      throw new NotFoundException(`Gallery item with ID "${id}" not found.`);
    }
    return galleryItem;
  }

  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
    const newGallery = this.galleryRepository.create(createGalleryDto);
    return this.galleryRepository.save(newGallery);
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find();
  }

  async findOne(id: string): Promise<Gallery> {
    return this.findGalleryItemById(id);
  }

  async update(
    id: string,
    updateGalleryDto: UpdateGalleryDto,
  ): Promise<Gallery> {
    const galleryItem = await this.findGalleryItemById(id);
    this.galleryRepository.merge(galleryItem, updateGalleryDto);
    return this.galleryRepository.save(galleryItem);
  }

  async updateCatalogue(id: string, cataloguePath: string): Promise<Gallery> {
    if (!cataloguePath) {
      throw new BadRequestException('A catalogue file is required.');
    }
    const galleryItem = await this.findGalleryItemById(id);
    galleryItem.catalogue = cataloguePath;
    return this.galleryRepository.save(galleryItem);
  }

  async updateCoverImage(id: string, coverImagePath: string): Promise<Gallery> {
    if (!coverImagePath) {
      throw new BadRequestException('A cover image file is required.');
    }
    const galleryItem = await this.findGalleryItemById(id);
    galleryItem.coverImage = coverImagePath;
    return this.galleryRepository.save(galleryItem);
  }

  async remove(id: string): Promise<void> {
    const result = await this.galleryRepository.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Gallery item with ID "${id}" not found.`);
    }
  }
}
