import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        controllers: [AuthController],
        providers: [AuthService],
        exports: [AuthService],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map