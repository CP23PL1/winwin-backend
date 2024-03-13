export class UserInfoDto {
  phone_number: string;
  user_id: string;
  connection: string;
  'cp23pl1/roles': Role[];
}

export enum Role {
  Driver = 'Driver',
  Passenger = 'Passenger',
}
