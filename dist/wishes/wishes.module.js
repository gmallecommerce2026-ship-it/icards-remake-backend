import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { WishesController } from './wishes.controller.js';
import { WishesService } from './wishes.service.js';
let WishesModule = class WishesModule {
};
WishesModule = __decorate([
    Module({
        controllers: [WishesController],
        providers: [WishesService],
        exports: [WishesService],
    })
], WishesModule);
export { WishesModule };
//# sourceMappingURL=wishes.module.js.map