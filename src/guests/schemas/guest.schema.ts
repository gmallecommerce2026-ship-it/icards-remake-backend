import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export const RSVP = ['pending', 'attending', 'declined'] as const;
export type RsvpStatus = (typeof RSVP)[number];
export const EMAIL_STATUS = ['not-sent', 'sent', 'failed'] as const;
export type EmailStatus = (typeof EMAIL_STATUS)[number];

@Schema({ timestamps: true })
export class Guest {
  @Prop({ type: Types.ObjectId, ref: 'Invitation', required: true, index: true }) invitation: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) owner: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 120 }) name: string;
  @Prop({ trim: true, lowercase: true, maxlength: 200 }) email?: string;
  @Prop({ trim: true, maxlength: 20 }) phone?: string;
  @Prop({ type: Types.ObjectId, ref: 'GuestGroup', default: null }) group: Types.ObjectId | null;
  @Prop({ type: String, enum: RSVP, default: 'pending' }) status: RsvpStatus;
  /** "Đi cùng": số người đi kèm */
  @Prop({ default: 0, min: 0, max: 20 }) companions: number;
  /** "Mừng cưới" (VND) */
  @Prop({ default: 0, min: 0 }) giftAmount: number;
  @Prop({ trim: true, maxlength: 1000 }) note?: string;
  @Prop({ trim: true, maxlength: 1000 }) rsvpMessage?: string;
  @Prop({ type: Date }) respondedAt?: Date;

  /** Mã bí mật trong link thiệp cá nhân hoá (?guestId=<token>) */
  @Prop({ required: true, unique: true }) token: string;
  @Prop({ type: String, enum: EMAIL_STATUS, default: 'not-sent' }) emailStatus: EmailStatus;
  @Prop({ type: Date }) emailSentAt?: Date;
  @Prop() emailError?: string;
  @Prop({ default: 0 }) emailAttempts: number;
}

export type GuestDocument = HydratedDocument<Guest>;
export const GuestSchema = SchemaFactory.createForClass(Guest);
GuestSchema.index({ invitation: 1, email: 1 });
GuestSchema.index({ invitation: 1, status: 1 });
