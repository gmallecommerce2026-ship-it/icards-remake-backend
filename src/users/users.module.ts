import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User, UserSchema } from './schemas/user.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), PassportModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}