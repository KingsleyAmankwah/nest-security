import { IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  token: string;

  @IsUUID()
  userId: string;
}
