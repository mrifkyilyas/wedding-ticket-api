import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AdminDocument = Admin & mongoose.Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Admin {
  @Prop({ required: true, type: String })
  userName: string;
  @Prop({ required: true, type: String })
  email: string;
  @Prop({ required: true, type: String })
  password: string;
}

const hidden = ['password', '__v'];
const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  for (let i = hidden.length - 1; i >= 0; i--) {
    delete obj[hidden[i]];
  }
  return obj;
};

export { AdminSchema };
