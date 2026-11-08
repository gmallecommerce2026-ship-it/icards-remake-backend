import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
let InvitationsModule = class InvitationsModule {
};
InvitationsModule = __decorate([
    Module({
        controllers: [InvitationsController],
        providers: [InvitationsService],
        exports: [InvitationsService],
    })
], InvitationsModule);
export { InvitationsModule };
//# sourceMappingURL=invitations.module.js.map