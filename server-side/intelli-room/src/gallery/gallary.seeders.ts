import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';

@Injectable()
export class GallerySeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: MongoRepository<Gallery>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SEED_ON_BOOT === 'false') {
      return;
    }

    const count = await this.galleryRepository.countDocuments();
    if (count > 0) {
      console.log('Database already has gallery items, skipping seeder.');
      return;
    }

    const galleryItems = [
      {
        name: 'HomeH',
        catalogue: 'uploads/gallery/PureFurniturelookbook.pdf',
        coverImage: 'uploads/gallery/HomeH.png',
      },
      {
        name: 'Daze',
        catalogue: 'uploads/gallery/GALLERY_FURNITURE_CATALOG.pdf',
        coverImage: 'uploads/gallery/Daze.png',
      },
      {
        name: 'Concept',
        catalogue: 'uploads/gallery/FRIGERIO 2023.pdf',
        coverImage: 'uploads/gallery/Concept.png',
      },
    ];

    await this.galleryRepository.save(galleryItems);
    console.log('Initial gallery items seeded successfully.');
  }
}
