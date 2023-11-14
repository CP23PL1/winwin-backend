import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSpotsService } from './service-spots.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { QueryBuilder, Repository } from 'typeorm';
import { CreateServiceSpot } from './dto/create-service-spot.dto';

const queryBuilder: any = {
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  setParameters: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
};

describe('ServiceSpotsService', () => {
  const REPOSITORY_TOKEN = getRepositoryToken(ServiceSpot);
  let service: ServiceSpotsService;
  let repository: Repository<ServiceSpot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceSpotsService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceSpotsService>(ServiceSpotsService);
    repository = module.get<Repository<ServiceSpot>>(REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return all service spots nearby', async () => {
    jest.spyOn(QueryBuilder.prototype, 'createQueryBuilder').mockReturnValueOnce(queryBuilder);

    const result = await service.findAllByDistance(100.5, 13.13, 100);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  describe('create service spot', () => {
    it('should create a service spot', async () => {
      const data: CreateServiceSpot = {
        name: 'Test Service Spot',
        placeId: 'test-place-id',
        coords: {
          type: 'Point',
          coordinates: [100.5, 13.13],
        },
      };
      const result = await service.create(data);
      expect(result.name).toBe(data.name);
      expect(result.placeId).toBe(data.placeId);
      expect(result.coords).toBe(data.coords);
    });
  });
});
