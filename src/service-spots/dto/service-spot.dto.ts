import { Point } from 'typeorm';

export class ServiceSpotDto {
  id: number;
  name: string;
  placeId: string;
  coords: Point;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  distance: number;
}
