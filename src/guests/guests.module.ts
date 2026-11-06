import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationGuestsController, MasterGuestsController, PublicGuestsController } from './guests.controller.js';
import { GuestsService } from './guests.service.js';
import { Guest, GuestSchema } from './schemas/guest.schema.js';
import { GuestGroup, GuestGroupSchema } from './schemas/guest-group.schema.js';
import { MasterGuest, MasterGuestSchema } from './schemas/master-guest.schema.js';
import { InvitationsModule } from '../invitations/invitations.module.js';

@Module({
  imports: [
    InvitationsModule,
    MongooseModule.forFeature([
      { name: Guest.name, schema: GuestSchema },
      { name: GuestGroup.name, schema: GuestGroupSchema },
      { name: MasterGuest.name, schema: MasterGuestSchema },
    ]),
  ],
  controllers: [InvitationGuestsController, PublicGuestsController, MasterGuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
