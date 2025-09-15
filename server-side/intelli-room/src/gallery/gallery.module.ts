import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Gallery } from './entities/gallery.entity';
import { GallerySeeder } from './gallary.seeders';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery])],
  controllers: [GalleryController],
  providers: [GalleryService, GallerySeeder],
  exports: [GalleryService],
})
export class GalleryModule {}
