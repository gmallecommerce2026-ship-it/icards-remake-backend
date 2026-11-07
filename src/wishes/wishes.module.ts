import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { WishesController } from './wishes.controller.js';
import { WishesService } from './wishes.service.js';
import { Wish, WishSchema } from './schemas/wish.schema.js';
import { Guest, GuestSchema } from '../guests/schemas/guest.schema.js';
import { InvitationsModule } from '../invitations/invitations.module.js';

@Module({
  imports: [
    InvitationsModule,
    MongooseModule.forFeature([{ name: Wish.name, schema: WishSchema }, { name: Guest.name, schema: GuestSchema }]),
    PassportModule,
  ],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}