import { Types } from 'mongoose';

export class GenerateJWTTokenInput {
  morph: Types.ObjectId;
  morphModel: string;
}
