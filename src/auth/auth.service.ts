import { BadGatewayException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { GenerateJWTTokenInput } from './dto/generate-jwt-token.dto';
import { Auth } from './entities/auth.entity';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { ActorCtx } from './auth.guard';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<Auth>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateStaticToken(): string {
    const staticToken = `WAP${this.randomNumber(10)}${this.randomChar(
      3,
    )}${dayjs().format('x')}`;
    return staticToken;
  }

  randomNumber = (length = 6) =>
    Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    );

  randomChar = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  async create(generateJwtTokenInput: GenerateJWTTokenInput): Promise<Auth> {
    const staticToken = this.generateStaticToken();
    const auth = new this.authModel({
      accessToken: staticToken,
      morph: generateJwtTokenInput.morph,
      morphModel: generateJwtTokenInput.morphModel,
      expiresAt: dayjs()
        .add(this.configService.JWT_EXPIRED_IN_SECOND, 'second')
        .toDate(),
    });
    await auth.save();
    return auth;
  }

  async generateJwtToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.JWT_EXPIRED_IN_SECOND,
      secret: this.configService.JWT_SECRET,
    });
  }

  async verify(token: string): Promise<any> {
    try {
      const tokenWithoutBearer = token.replace('Bearer ', '');
      const jwtPayload = (await this.jwtService.verifyAsync(
        tokenWithoutBearer,
        {
          secret: this.configService.JWT_SECRET,
        },
      )) as ActorCtx;
      if (!jwtPayload?.authToken) {
        throw new Error('Invalid token');
      }
      const auth = await this.authModel.findOne({
        accessToken: jwtPayload.authToken,
      });
      if (!auth) {
        throw new Error('Invalid token');
      }
      if (auth.expiresAt < new Date()) {
        throw new Error('Token expired');
      }
      return auth;
    } catch (error) {
      throw new BadGatewayException('Invalid token');
    }
  }
}
