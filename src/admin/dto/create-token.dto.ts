export class CreateTokenDto {
  accessToken: string;
  refreshToken: string;
  morph: string;
  morphModel: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}
