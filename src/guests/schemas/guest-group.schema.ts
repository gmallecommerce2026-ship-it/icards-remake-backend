import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class GuestGroup {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true }) invitation: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 60 }) name: string;
  @Prop({ trim: true, maxlength: 20 }) color?: string;
}

export type GuestGroupDocument = HydratedDocument<GuestGroup>;
export const GuestGroupSchema = SchemaFactory.createForClass(GuestGroup);
GuestGroupSchema.index({ invitation: 1, name: 1 }, { unique: true });
