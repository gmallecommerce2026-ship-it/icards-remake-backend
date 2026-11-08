import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
let TemplatesModule = class TemplatesModule {
};
TemplatesModule = __decorate([
    Module({
        controllers: [TemplatesController],
        providers: [TemplatesService],
        exports: [TemplatesService],
    })
], TemplatesModule);
export { TemplatesModule };
//# sourceMappingURL=templates.module.js.map