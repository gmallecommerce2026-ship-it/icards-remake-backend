import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { RemindersController } from './reminders.controller.js';
import { RemindersService } from './reminders.service.js';
import { EventReminder } from './schemas/event-reminder.schema.js';
import { Invitation } from '../invitations/schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { InvitationsModule } from '../invitations/invitations.module.js';

@Module({
  imports: [InvitationsModule, TypeOrmModule.forFeature([EventReminder, Invitation, Guest]), PassportModule.register({})],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
