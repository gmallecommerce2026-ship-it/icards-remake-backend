import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';
let PagesModule = class PagesModule {
};
PagesModule = __decorate([
    Module({
        controllers: [PagesController],
        providers: [PagesService],
        exports: [PagesService],
    })
], PagesModule);
export { PagesModule };
//# sourceMappingURL=pages.module.js.map