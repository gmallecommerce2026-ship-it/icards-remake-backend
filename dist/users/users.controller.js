import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service.js';
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
};
UsersController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map