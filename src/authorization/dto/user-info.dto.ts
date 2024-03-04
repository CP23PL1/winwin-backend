export class UserInfoDto {
  name: string;
  phoneNumber: string;
  nickname: string;
  sub: string;
  'cp23pl1/roles': Role[];
  updatedAt: string;
}

export enum Role {
  Driver = 'Driver',
  Passenger = 'Passenger',
}
