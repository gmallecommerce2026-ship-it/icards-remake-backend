import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Wish {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true }) invitation: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Guest', default: null }) guest: Types.ObjectId | null;
  @Prop({ required: true, trim: true, maxlength: 80 }) name: string;
  @Prop({ required: true, trim: true, maxlength: 1000 }) message: string;
  /** false: đang chờ duyệt / bị ẩn */
  @Prop({ default: true, index: true }) isApproved: boolean;
}

export type WishDocument = HydratedDocument<Wish>;
export const WishSchema = SchemaFactory.createForClass(Wish);
WishSchema.index({ invitation: 1, createdAt: -1 });
