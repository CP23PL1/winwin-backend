import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';

@Injectable()
export class ServiceSpotsService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateServiceSpot) {
    return this.prisma.serviceSpot.create({ data });
  }

  findAll() {
    return this.prisma.serviceSpot.findMany();
  }

  findOne(id: string) {
    return this.prisma.serviceSpot.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateServiceSpot) {
    return this.prisma.serviceSpot.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.serviceSpot.delete({ where: { id } });
  }
}
