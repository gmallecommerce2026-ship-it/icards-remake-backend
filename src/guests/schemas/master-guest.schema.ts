import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

/** "Danh bạ" khách mời của một chủ thiệp, dùng chung giữa các thiệp. */
@Schema({ timestamps: true })
export class MasterGuest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) owner: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 120 }) name: string;
  @Prop({ trim: true, lowercase: true, maxlength: 200 }) email?: string;
  @Prop({ trim: true, maxlength: 20 }) phone?: string;
  @Prop({ trim: true, maxlength: 60 }) groupName?: string;
}

export type MasterGuestDocument = HydratedDocument<MasterGuest>;
export const MasterGuestSchema = SchemaFactory.createForClass(MasterGuest);
MasterGuestSchema.index({ owner: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
MasterGuestSchema.index({ owner: 1, phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
