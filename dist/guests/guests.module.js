import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { GuestsController } from './guests.controller.js';
import { GuestsService } from './guests.service.js';
let GuestsModule = class GuestsModule {
};
GuestsModule = __decorate([
    Module({
        controllers: [GuestsController],
        providers: [GuestsService],
        exports: [GuestsService],
    })
], GuestsModule);
export { GuestsModule };
//# sourceMappingURL=guests.module.js.map