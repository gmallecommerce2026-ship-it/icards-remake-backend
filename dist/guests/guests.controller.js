import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { GuestsService } from './guests.service.js';
let GuestsController = class GuestsController {
    guestsService;
    constructor(guestsService) {
        this.guestsService = guestsService;
    }
};
GuestsController = __decorate([
    Controller('master-guests'),
    __metadata("design:paramtypes", [GuestsService])
], GuestsController);
export { GuestsController };
//# sourceMappingURL=guests.controller.js.map