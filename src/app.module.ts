import { Module } from '@nestjs/common';
import { join } from 'node:path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ServicesModule } from './services/services.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { SeedModule } from './seed/seed.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // Đường dẫn tuyệt đối: đọc đúng .env dù pm2 chạy với cwd nào
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [join(import.meta.dirname, '..', '.env')] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST') ?? '127.0.0.1',
        port: Number(cfg.get<string>('DB_PORT') ?? 3306),
        username: cfg.getOrThrow<string>('DB_USER'),
        password: cfg.getOrThrow<string>('DB_PASSWORD'),
        database: cfg.getOrThrow<string>('DB_NAME'),
        charset: 'utf8mb4',
        timezone: 'Z',
        autoLoadEntities: true,
        // AN TOÀN: chỉ tự đồng bộ bảng khi DB_SYNCHRONIZE=true được đặt rõ ràng (chỉ dùng cho DB mới/dev)
        synchronize: cfg.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
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
    ServicesModule,
    SettingsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
