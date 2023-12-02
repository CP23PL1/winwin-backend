import { Test } from '@nestjs/testing';
import { ServiceSpotsController } from './service-spots.controller';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { ServiceSpotsService } from './service-spots.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ServiceSpotsController', () => {
  let controller: ServiceSpotsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ServiceSpotsController],
    })
      .useMocker((token) => {
        const result: ServiceSpotDto[] = [
          {
            id: 1,
            name: 'Test Service Spot',
            placeId: 'test-place-id',
            coords: {
              lat: 13.13,
              lng: 100.5,
            },
            approved: false,
            createdAt: '2021-08-01T00:00:00.000Z',
            updatedAt: '2021-08-01T00:00:00.000Z',
            distance: 0,
          },
        ];

        if (token === ServiceSpotsService) {
          return {
            findAllByDistance: jest.fn().mockResolvedValue(result),
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get<ServiceSpotsController>(ServiceSpotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByDistance', () => {
    it('should return an array of service spots nearby', async () => {
      const result: ServiceSpotDto[] = [
        {
          id: 1,
          name: 'Test Service Spot',
          placeId: 'test-place-id',
          coords: {
            lat: 13.13,
            lng: 100.5,
          },
          approved: false,
          createdAt: '2021-08-01T00:00:00.000Z',
          updatedAt: '2021-08-01T00:00:00.000Z',
          distance: 0,
        },
      ];

      expect(await controller.findAll({ lat: 13.13, lng: 100.5, radius: 1000 })).toStrictEqual(
        result,
      );
    });
  });
});
