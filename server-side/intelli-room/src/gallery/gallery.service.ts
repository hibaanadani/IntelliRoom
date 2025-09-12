import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: MongoRepository<Gallery>,
  ) {}

  async create(
    createGalleryDto: CreateGalleryDto,
    cataloguePath: string | null,
    coverImagePath: string | null,
  ): Promise<Gallery> {
    const newGallery = this.galleryRepository.create({
      ...createGalleryDto,
      catalogue: cataloguePath,
      coverImage: coverImagePath,
    });
    return this.galleryRepository.save(newGallery);
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find();
  }

  async findOne(id: string): Promise<Gallery> {
    const galleryItem = await this.galleryRepository.findOneBy({
      _id: new ObjectId(id),
    });
    if (!galleryItem) {
      throw new NotFoundException(`Gallery item with ID "${id}" not found.`);
    }
    return galleryItem;
  }

  async update(
    id: string,
    updateGalleryDto: UpdateGalleryDto,
  ): Promise<Gallery> {
    const galleryItem = await this.findOne(id);
    const updatedGallery = { ...galleryItem, ...updateGalleryDto };
    return this.galleryRepository.save(updatedGallery);
  }

  async updateCatalogue(
    id: string,
    cataloguePath: string | null,
  ): Promise<Gallery> {
    if (!cataloguePath) {
      throw new BadRequestException('A catalogue file is required.');
    }
    const galleryItem = await this.findOne(id);
    galleryItem.catalogue = cataloguePath;
    return this.galleryRepository.save(galleryItem);
  }

  async updateCoverImage(
    id: string,
    coverImagePath: string | null,
  ): Promise<Gallery> {
    if (!coverImagePath) {
      throw new BadRequestException('A cover image file is required.');
    }
    const galleryItem = await this.findOne(id);
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
