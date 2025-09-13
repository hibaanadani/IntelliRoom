import { Test, TestingModule } from '@nestjs/testing';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { ObjectId } from 'mongodb';
import {
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/admin.guard';

const mockGalleryService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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

describe('GalleryController', () => {
  let controller: GalleryController;
  let service: GalleryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleryController],
      providers: [
        {
          provide: GalleryService,
          useValue: mockGalleryService(),
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GalleryController>(GalleryController);
    service = module.get<GalleryService>(GalleryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service and return a new gallery item', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockGallery);
      const result = await controller.create(mockCreateGalleryDto);
      expect(service.create).toHaveBeenCalledWith(mockCreateGalleryDto);
      expect(result).toEqual(mockGallery);
    });
  });

  describe('findAll', () => {
    it('should call the service and return an array of gallery items', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockGallery]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockGallery]);
    });
  });

  describe('findOne', () => {
    it('should call the service and return a single gallery item', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockGallery);
      const result = await controller.findOne(mockGallery._id.toHexString());
      expect(service.findOne).toHaveBeenCalledWith(
        mockGallery._id.toHexString(),
      );
      expect(result).toEqual(mockGallery);
    });

    it('should handle NotFoundException from the service', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Gallery item not found'));
      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should call the service and return the updated gallery item', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockGallery);
      const result = await controller.update(
        mockGallery._id.toHexString(),
        mockUpdateGalleryDto,
      );
      expect(service.update).toHaveBeenCalledWith(
        mockGallery._id.toHexString(),
        mockUpdateGalleryDto,
      );
      expect(result).toEqual(mockGallery);
    });

    it('should handle NotFoundException from the service', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('Gallery item not found'));
      await expect(
        controller.update('non-existent-id', mockUpdateGalleryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call the service and return no content on success', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      const result = await controller.remove(mockGallery._id.toHexString());
      expect(service.remove).toHaveBeenCalledWith(
        mockGallery._id.toHexString(),
      );
      expect(result).toBeUndefined();
    });

    it('should handle NotFoundException from the service', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new NotFoundException('Gallery item not found'));
      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
