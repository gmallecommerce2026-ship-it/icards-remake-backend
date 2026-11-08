import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            MongooseModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (cfg) => ({ uri: cfg.get('MONGO_URI') }),
            }),
            ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map