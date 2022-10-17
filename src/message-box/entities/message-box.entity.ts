import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { WillAttendEnum } from 'src/libs/enum/will-attend.enum';

export type MessageBoxDocument = MessageBox & mongoose.Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class MessageBox {
  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' })
  invitation: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: WillAttendEnum, default: WillAttendEnum.MAYBE })
  willAttend: WillAttendEnum;
}

export const MessageBoxSchema = SchemaFactory.createForClass(MessageBox);
