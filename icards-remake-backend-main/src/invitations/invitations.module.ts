import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { InvitationsController, PublicInvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { Invitation } from './schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { GuestGroup } from '../guests/schemas/guest-group.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Guest, GuestGroup, Wish]), PassportModule.register({})],
  // PublicInvitationsController đứng trước để /invitations/public/:id không bị :id nuốt
  controllers: [PublicInvitationsController, InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
