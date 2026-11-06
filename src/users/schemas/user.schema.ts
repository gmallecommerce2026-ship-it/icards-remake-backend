import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 40 }) username: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ select: false }) password?: string;
  @Prop({ trim: true, maxlength: 100 }) fullName?: string;
  @Prop({ trim: true, maxlength: 20 }) phone?: string;
  @Prop() avatar?: string;
  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' }) role: 'user' | 'admin';
  @Prop({ default: true }) isActive: boolean;
  @Prop({ type: [String], default: [] }) personalImages: string[];
  @Prop({ sparse: true, unique: true }) googleId?: string;
  @Prop({ sparse: true, unique: true }) facebookId?: string;
  @Prop({ select: false }) resetPasswordHash?: string;
  @Prop({ select: false }) resetPasswordExpires?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
