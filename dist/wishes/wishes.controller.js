import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { WishesService } from './wishes.service.js';
let WishesController = class WishesController {
    wishesService;
    constructor(wishesService) {
        this.wishesService = wishesService;
    }
};
WishesController = __decorate([
    Controller('wishes'),
    __metadata("design:paramtypes", [WishesService])
], WishesController);
export { WishesController };
//# sourceMappingURL=wishes.controller.js.map