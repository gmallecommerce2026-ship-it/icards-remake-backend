import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { InvitationsController, PublicInvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { Invitation, InvitationSchema } from './schemas/invitation.schema.js';
import { Guest, GuestSchema } from '../guests/schemas/guest.schema.js';
import { GuestGroup, GuestGroupSchema } from '../guests/schemas/guest-group.schema.js';
import { Wish, WishSchema } from '../wishes/schemas/wish.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema },
      { name: Guest.name, schema: GuestSchema },
      { name: GuestGroup.name, schema: GuestGroupSchema },
      { name: Wish.name, schema: WishSchema },
    ]),
    PassportModule,
  ],
  // PublicInvitationsController đứng trước để /invitations/public/:id không bị :id nuốt
  controllers: [PublicInvitationsController, InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService, MongooseModule],
})
export class InvitationsModule {}