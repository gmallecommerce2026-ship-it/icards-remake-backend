import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
};
SettingsController = __decorate([
    Controller('public/settings'),
    __metadata("design:paramtypes", [SettingsService])
], SettingsController);
export { SettingsController };
//# sourceMappingURL=settings.controller.js.map