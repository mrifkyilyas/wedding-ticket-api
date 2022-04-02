import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInInvitationDto {
  @IsNotEmpty()
  @IsString()
  slug: string;
}
