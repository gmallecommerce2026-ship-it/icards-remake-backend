import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';
let SettingsModule = class SettingsModule {
};
SettingsModule = __decorate([
    Module({
        controllers: [SettingsController],
        providers: [SettingsService],
        exports: [SettingsService],
    })
], SettingsModule);
export { SettingsModule };
//# sourceMappingURL=settings.module.js.map