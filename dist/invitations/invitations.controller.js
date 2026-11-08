import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { InvitationsService } from './invitations.service.js';
let InvitationsController = class InvitationsController {
    invitationsService;
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
    }
};
InvitationsController = __decorate([
    Controller('invitations'),
    __metadata("design:paramtypes", [InvitationsService])
], InvitationsController);
export { InvitationsController };
//# sourceMappingURL=invitations.controller.js.map