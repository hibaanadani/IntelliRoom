import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: MongoRepository<Gallery>,
  ) {}

  private async getNextGalleryId(): Promise<number> {
    const highestIdGallery = await this.galleryRepository.findOne({
      order: { id: 'DESC' },
    });
    return highestIdGallery ? highestIdGallery.id + 1 : 1;
  }

  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
    const nextId = await this.getNextGalleryId();
    const newGallery = this.galleryRepository.create({
      id: nextId,
      ...createGalleryDto,
    });
    return this.galleryRepository.save(newGallery);
  }

  async findAll(): Promise<Gallery[]> {
    return this.galleryRepository.find();
  }

  async findById(id: number): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOneBy({ id });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return gallery;
  }

  async update(
    id: number,
    updateGalleryDto: UpdateGalleryDto,
  ): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOneBy({ id });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    Object.assign(gallery, updateGalleryDto);
    return this.galleryRepository.save(gallery);
  }

  async remove(id: number): Promise<void> {
    const result = await this.galleryRepository.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
  }
}
