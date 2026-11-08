import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { WishesController } from './wishes.controller.js';
import { WishesService } from './wishes.service.js';
import { Wish } from './schemas/wish.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { InvitationsModule } from '../invitations/invitations.module.js';

@Module({
  imports: [InvitationsModule, TypeOrmModule.forFeature([Wish, Guest]), PassportModule.register({})],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}
