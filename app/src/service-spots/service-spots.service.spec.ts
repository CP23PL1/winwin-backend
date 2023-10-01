import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSpotsService } from './service-spots.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('ServiceSpotsService', () => {
  let service: ServiceSpotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ServiceSpotsService],
    }).compile();

    service = module.get<ServiceSpotsService>(ServiceSpotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
