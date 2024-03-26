import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateDriveRequestChatDto {
  @IsString()
  driveRequestSid: string;

  @IsPositive()
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
