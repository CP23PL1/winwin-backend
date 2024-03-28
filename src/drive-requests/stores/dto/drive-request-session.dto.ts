import { PartialType } from '@nestjs/mapped-types';
import { DriveRequestPreviewDto } from 'src/drive-requests/dto/drive-request-preview.dto';
import { Waypoint } from 'src/shared/dtos/place.dto';

export enum DriveRequestSessionStatus {
  PENDING = 'pending',
  ON_GOING = 'on_going',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class DriveRequestSession extends PartialType(DriveRequestPreviewDto) {
  sid?: string;
  userId?: string;
  driverId?: string;
  origin?: Waypoint;
  destination?: Waypoint;
  status?: DriveRequestSessionStatus;
  id?: string;
  createdAt?: string;
}
