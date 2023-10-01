import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
