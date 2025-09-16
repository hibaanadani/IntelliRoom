import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { GalleryService } from './gallery.service';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { ObjectId } from 'mongodb';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockMongoRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  deleteOne: jest.fn(),
});

const mockGallery: Gallery = {
  _id: new ObjectId(),
  name: 'Gallery Item 1',
  catalogue: 'path/to/catalogue1.pdf',
  coverImage: 'path/to/cover1.jpg',
};

const mockCreateGalleryDto: CreateGalleryDto = {
  name: 'New Gallery Item',
  catalogue: 'catalogue.pdf',
  coverImage: 'cover.jpg',
};

const mockUpdateGalleryDto: UpdateGalleryDto = {
  name: 'Updated Name',
};

describe('GalleryService', () => {
  let service: GalleryService;
  let galleryRepository: MongoRepository<Gallery>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryService,
        {
          provide: getRepositoryToken(Gallery),
          useValue: mockMongoRepository(),
        },
      ],
    }).compile();

    service = module.get<GalleryService>(GalleryService);
    galleryRepository = module.get<MongoRepository<Gallery>>(
      getRepositoryToken(Gallery),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new gallery item', async () => {
      jest
        .spyOn(galleryRepository, 'create')
        .mockReturnValue(mockGallery as any);
      jest
        .spyOn(galleryRepository, 'save')
        .mockResolvedValue(mockGallery as any);

      const result = await service.create(mockCreateGalleryDto);

      expect(galleryRepository.create).toHaveBeenCalledWith(
        mockCreateGalleryDto,
      );
      expect(galleryRepository.save).toHaveBeenCalledWith(mockGallery);
      expect(result).toEqual(mockGallery);
    });
  });

  describe('findAll', () => {
    it('should return an array of gallery items', async () => {
      jest
        .spyOn(galleryRepository, 'find')
        .mockResolvedValue([mockGallery] as any);
      const result = await service.findAll();
      expect(result).toEqual([mockGallery]);
      expect(galleryRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single gallery item by ID', async () => {
      jest
        .spyOn(galleryRepository, 'findOneBy')
        .mockResolvedValue(mockGallery as any);
      const result = await service.findOne(mockGallery._id.toHexString());
      expect(galleryRepository.findOneBy).toHaveBeenCalledWith({
        _id: mockGallery._id,
      });
      expect(result).toEqual(mockGallery);
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if gallery item is not found', async () => {
      jest.spyOn(galleryRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.findOne(new ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a gallery item and return the updated item', async () => {
      jest
        .spyOn(galleryRepository, 'findOneBy')
        .mockResolvedValue(mockGallery as any);
      const updatedGallery = {
        ...mockGallery,
        name: mockUpdateGalleryDto.name,
      };
      jest
        .spyOn(galleryRepository, 'merge')
        .mockReturnValue(updatedGallery as any);
      jest
        .spyOn(galleryRepository, 'save')
        .mockResolvedValue(updatedGallery as any);

      const result = await service.update(
        mockGallery._id.toHexString(),
        mockUpdateGalleryDto,
      );

      expect(galleryRepository.findOneBy).toHaveBeenCalledWith({
        _id: mockGallery._id,
      });
      expect(galleryRepository.merge).toHaveBeenCalledWith(
        mockGallery,
        mockUpdateGalleryDto,
      );
      expect(galleryRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual(mockUpdateGalleryDto.name);
    });

    it('should throw NotFoundException if item to update is not found', async () => {
      jest.spyOn(galleryRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.update(new ObjectId().toHexString(), mockUpdateGalleryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCatalogue', () => {
    it('should update a gallery item with a new catalogue path', async () => {
      const cataloguePath = 'new/path/to/catalogue.pdf';
      const updatedGallery = { ...mockGallery, catalogue: cataloguePath };

      jest
        .spyOn(galleryRepository, 'findOneBy')
        .mockResolvedValue(mockGallery as any);
      jest
        .spyOn(galleryRepository, 'save')
        .mockResolvedValue(updatedGallery as any);

      const result = await service.updateCatalogue(
        mockGallery._id.toHexString(),
        cataloguePath,
      );

      expect(galleryRepository.findOneBy).toHaveBeenCalledWith({
        _id: mockGallery._id,
      });
      expect(galleryRepository.save).toHaveBeenCalledWith(updatedGallery);
      expect(result.catalogue).toEqual(cataloguePath);
    });

    it('should throw BadRequestException if cataloguePath is empty', async () => {
      await expect(
        service.updateCatalogue(mockGallery._id.toHexString(), ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item to update is not found', async () => {
      jest.spyOn(galleryRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.updateCatalogue(new ObjectId().toHexString(), 'path'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCoverImage', () => {
    it('should update a gallery item with a new cover image path', async () => {
      const coverImagePath = 'new/path/to/cover.jpg';
      const updatedGallery = { ...mockGallery, coverImage: coverImagePath };

      jest
        .spyOn(galleryRepository, 'findOneBy')
        .mockResolvedValue(mockGallery as any);
      jest
        .spyOn(galleryRepository, 'save')
        .mockResolvedValue(updatedGallery as any);

      const result = await service.updateCoverImage(
        mockGallery._id.toHexString(),
        coverImagePath,
      );

      expect(galleryRepository.findOneBy).toHaveBeenCalledWith({
        _id: mockGallery._id,
      });
      expect(galleryRepository.save).toHaveBeenCalledWith(updatedGallery);
      expect(result.coverImage).toEqual(coverImagePath);
    });

    it('should throw BadRequestException if coverImagePath is empty', async () => {
      await expect(
        service.updateCoverImage(mockGallery._id.toHexString(), ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item to update is not found', async () => {
      jest.spyOn(galleryRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.updateCoverImage(new ObjectId().toHexString(), 'path'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a gallery item', async () => {
      jest
        .spyOn(galleryRepository, 'deleteOne')
        .mockResolvedValue({ deletedCount: 1 } as any);
      await expect(
        service.remove(mockGallery._id.toHexString()),
      ).resolves.toBeUndefined();
      expect(galleryRepository.deleteOne).toHaveBeenCalledWith({
        _id: mockGallery._id,
      });
    });

    it('should throw NotFoundException if item to remove is not found', async () => {
      jest
        .spyOn(galleryRepository, 'deleteOne')
        .mockResolvedValue({ deletedCount: 0 } as any);
      await expect(
        service.remove(new ObjectId().toHexString()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
