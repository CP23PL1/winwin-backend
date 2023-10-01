import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSpotsController } from './service-spots.controller';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { PrismaModule } from '../prisma/prisma.module';

describe('ServiceSpotsController', () => {
  let controller: ServiceSpotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [ServiceSpotsController],
      providers: [ServiceSpotsService],
    }).compile();

    controller = module.get<ServiceSpotsController>(ServiceSpotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const data: CreateServiceSpot = {
    name: 'Test Service Spot',
    address: 'Test Address',
    latitude: 13.13,
    longitude: 100.5,
  };

  controller?.create(data).then((created) => {
    it('should create a service spot', () => {
      expect(created).toEqual({
        id: expect.any(String),
        ...data,
      });
    });

    it('should find all service spots', () => {
      expect(controller.findAll()).toEqual([]);
    });

    it('should find one service spot', () => {
      expect(controller.findOne(created.id)).toEqual(created);
    });
  });
});
