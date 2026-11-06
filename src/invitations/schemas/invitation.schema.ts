import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, type HydratedDocument } from 'mongoose';

export const EVENT_TYPES = ['wedding', 'birthday', 'baby', 'event'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

@Schema({ _id: false })
export class InvitationSettings {
  @Prop({ default: true }) allowRsvp: boolean;
  @Prop({ default: true }) allowWishes: boolean;
  /** true: lời chúc phải được chủ thiệp duyệt mới hiện công khai */
  @Prop({ default: false }) moderateWishes: boolean;
  @Prop({ default: false }) showGuestList: boolean;
  @Prop({ default: 5, min: 0, max: 20 }) maxCompanions: number;
  @Prop({ type: Date }) rsvpDeadline?: Date;
}

export const InvitationSettingsSchema = SchemaFactory.createForClass(InvitationSettings);

@Schema({ _id: true })
export class PlannerTask {
  @Prop({ required: true, trim: true, maxlength: 200 }) title: string;
  @Prop({ default: false }) done: boolean;
  @Prop({ type: Date }) dueDate?: Date;
  @Prop({ trim: true, maxlength: 60 }) category?: string;
  @Prop({ trim: true, maxlength: 1000 }) note?: string;
}
export const PlannerTaskSchema = SchemaFactory.createForClass(PlannerTask);

// minimize:false -> giữ object rỗng ({}), tránh info/page/design bị Mongoose xoá mất khi rỗng
@Schema({ timestamps: true, minimize: false })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) owner: Types.ObjectId;
  @Prop({ required: true, trim: true, maxlength: 200 }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop({ type: String, enum: EVENT_TYPES, default: 'wedding' }) eventType: EventType;
  @Prop({ trim: true }) templateSlug?: string;
  @Prop({ type: String, enum: ['draft', 'published'], default: 'draft', index: true }) status: 'draft' | 'published';
  @Prop({ type: Date }) eventDate?: Date;
  @Prop() cover?: string;

  /** EventPageData.info của studio: { title, description, host, date, time, venue, address } */
  @Prop({ type: Object, default: {} }) info: Record<string, unknown>;
  /** EventPageData còn lại: { styleId, accent, bg, blocks[] } */
  @Prop({ type: Object, default: {} }) page: Record<string, unknown>;
  /** Thiết kế thiệp: { pages, backdrops, envelope:{color,liner,stampId,recipientName} } */
  @Prop({ type: Object, default: {} }) design: Record<string, unknown>;

  @Prop({ type: InvitationSettingsSchema, default: () => ({}) }) settings: InvitationSettings;
  /** Ngân sách (PUT /budgetRequest): { total, items:[{name,estimate,actual,paid,note}] } */
  @Prop({ type: Object, default: {} }) budget: Record<string, unknown>;
  @Prop({ type: [PlannerTaskSchema], default: [] }) tasks: Types.DocumentArray<PlannerTask>;

  @Prop({ default: 0 }) views: number;
  @Prop({ type: Date }) publishedAt?: Date;
}

export type InvitationDocument = HydratedDocument<Invitation>;
export const InvitationSchema = SchemaFactory.createForClass(Invitation);
InvitationSchema.index({ owner: 1, createdAt: -1 });
