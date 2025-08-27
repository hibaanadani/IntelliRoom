import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Catalogue } from './entities/catalogue.entity';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';
import { Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../mongodb/mongodb.module';

@Injectable()
export class CatalogueService {
  constructor(
    @Inject(MONGO_DB)
    private readonly database: Db,
  ) {}

  // A private helper function to get the 'catalogue' collection from the database.
  private getCataloguesCollection() {
    return this.database.collection<Catalogue>('catalogues');
  }

  // A private helper function to get the next available catalogue ID.
  private async getNextCatalogueId(): Promise<number> {
    const cataloguesWithHighestId = await this.getCataloguesCollection()
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    return cataloguesWithHighestId.length > 0 ? cataloguesWithHighestId[0].id + 1 : 1;
  }

  async createCatalogue(createCatalogueDto: CreateCatalogueDto): Promise<Catalogue> {
    const nextId = await this.getNextCatalogueId();
    const newCatalogue: Catalogue = {
      id: nextId,
      season: createCatalogueDto.season || '',
      gallary: createCatalogueDto.gallary || '',
    };
    // The `_id` will be created automatically by MongoDB. We will exclude it from the response later.
    await this.getCataloguesCollection().insertOne(newCatalogue as any);
    return newCatalogue;
  }

  async findAll(): Promise<Catalogue[]> {
    return this.getCataloguesCollection()
      .find({}, { projection: { _id: 0 } })
      .toArray();
  }

  // Get a single catalogue by ID
  async findById(id: number): Promise<Catalogue> {
    const catalogue = await this.getCataloguesCollection()
      .findOne({ id }, { projection: { _id: 0 } });
    if (!catalogue) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
    return catalogue;
  }

  async updateCatalogue(id: number, updateCatalogueDto: UpdateCatalogueDto): Promise<Catalogue> {
    const result = await this.getCataloguesCollection().findOneAndUpdate(
      { id },
      { $set: updateCatalogueDto },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    if (!result) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
    return result as Catalogue;
  }

  async deleteCatalogue(id: number): Promise<void> {
    const result = await this.getCataloguesCollection().deleteOne({ id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Catalogue with ID ${id} not found.`);
    }
  }
}