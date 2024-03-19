import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class DriveRequestChatDto {
  @IsPositive()
  driveRequestId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
