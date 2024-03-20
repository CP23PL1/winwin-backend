import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class DriveRequestChatDto {
  @IsPositive()
  to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
