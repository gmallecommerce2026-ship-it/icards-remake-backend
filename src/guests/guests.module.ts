import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { InvitationGuestsController, MasterGuestsController, PublicGuestsController } from './guests.controller.js';
import { GuestsService } from './guests.service.js';
import { Guest } from './schemas/guest.schema.js';
import { GuestGroup } from './schemas/guest-group.schema.js';
import { MasterGuest } from './schemas/master-guest.schema.js';
import { InvitationsModule } from '../invitations/invitations.module.js';

@Module({
  imports: [InvitationsModule, TypeOrmModule.forFeature([Guest, GuestGroup, MasterGuest]), PassportModule.register({})],
  controllers: [InvitationGuestsController, PublicGuestsController, MasterGuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
