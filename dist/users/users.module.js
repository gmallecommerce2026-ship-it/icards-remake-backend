import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    Module({
        controllers: [UsersController],
        providers: [UsersService],
        exports: [UsersService],
    })
], UsersModule);
export { UsersModule };
//# sourceMappingURL=users.module.js.map