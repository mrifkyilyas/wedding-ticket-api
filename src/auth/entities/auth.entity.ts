import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AuthDocument = Auth & mongoose.Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Auth {
  @Prop({ required: true, type: String })
  accessToken: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'morphModel',
  })
  morph: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['Admin'],
  })
  morphModel: string;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
