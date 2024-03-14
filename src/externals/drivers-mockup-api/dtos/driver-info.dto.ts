import { Vehicle } from './vehicle.dto';

export class DriverInfoDto {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  profileImage: string;
  vehicle: Vehicle;
}
