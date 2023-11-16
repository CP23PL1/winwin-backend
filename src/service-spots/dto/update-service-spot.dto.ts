import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceSpot } from './create-service-spot.dto';

export class UpdateServiceSpot extends PartialType(CreateServiceSpot) {}
