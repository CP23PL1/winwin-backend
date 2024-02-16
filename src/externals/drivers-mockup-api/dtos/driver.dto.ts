import { Vehicle } from './vehicle.dto';

export class DriverDto {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  vehicle: Vehicle;
}
