import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { PagesService } from './pages.service.js';
let PagesController = class PagesController {
    pagesService;
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
};
PagesController = __decorate([
    Controller('pages'),
    __metadata("design:paramtypes", [PagesService])
], PagesController);
export { PagesController };
//# sourceMappingURL=pages.controller.js.map