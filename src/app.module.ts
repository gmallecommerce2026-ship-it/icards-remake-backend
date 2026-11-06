import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from './mail/mail.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { GuestsModule } from './guests/guests.module.js';
import { WishesModule } from './wishes/wishes.module.js';
import { TemplatesModule } from './templates/templates.module.js';
import { PagesModule } from './pages/pages.module.js';
import { ProductsModule } from './products/products.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({ uri: cfg.getOrThrow<string>('MONGO_URI') }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    MailModule,
    StorageModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    GuestsModule,
    WishesModule,
    TemplatesModule,
    PagesModule,
    ProductsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
