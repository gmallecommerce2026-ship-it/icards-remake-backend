import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
};
TemplatesController = __decorate([
    Controller('invitation-templates'),
    __metadata("design:paramtypes", [TemplatesService])
], TemplatesController);
export { TemplatesController };
//# sourceMappingURL=templates.controller.js.map