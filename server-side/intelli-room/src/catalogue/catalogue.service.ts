import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Catalogue } from './entities/catalogue.entity';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';

@Injectable()
export class CatalogueService {
  constructor(
    @InjectRepository(Catalogue)
    private readonly catalogueRepository: MongoRepository<Catalogue>,
  ) {}

  private async getNextCatalogueId(): Promise<number> {
    const highestIdCatalogue = await this.catalogueRepository.findOne({
      order: { id: 'DESC' },
    });
    return highestIdCatalogue ? highestIdCatalogue.id + 1 : 1;
  }

  async createCatalogue(
    createCatalogueDto: CreateCatalogueDto,
  ): Promise<Catalogue> {
    const nextId = await this.getNextCatalogueId();
    const newCatalogue = this.catalogueRepository.create({
      id: nextId,
      season: createCatalogueDto.season,
      galleryId: createCatalogueDto.galleryId,
    });
    return await this.catalogueRepository.save(newCatalogue);
  }

  async findAll(): Promise<Catalogue[]> {
    return this.catalogueRepository.find();
  }

  async findById(id: number): Promise<Catalogue> {
    const catalogue = await this.catalogueRepository.findOneBy({ id });
    if (!catalogue) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
    return catalogue;
  }

  async updateCatalogue(
    id: number,
    updateCatalogueDto: UpdateCatalogueDto,
  ): Promise<Catalogue> {
    const catalogue = await this.catalogueRepository.findOneBy({ id });
    if (!catalogue) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
    Object.assign(catalogue, updateCatalogueDto);
    return await this.catalogueRepository.save(catalogue);
  }

  async deleteCatalogue(id: number): Promise<void> {
    const result = await this.catalogueRepository.deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
  }
}
