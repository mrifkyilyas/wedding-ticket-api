import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

export type InvitationDocument = Invitation & mongoose.Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Invitation {
  @Prop()
  name: string;

  @Prop({ required: true, type: Boolean, default: false })
  status: boolean;

  @Prop({ type: String, default: '' })
  location: string;

  @Prop({
    type: String,
    slug: ['name'],
    sparse: true,
    unique: true,
    slugPaddingSize: 2,
  })
  slug: string;

  @Prop({ type: Date, default: null })
  checkInTime: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
