import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
let ProductsModule = class ProductsModule {
};
ProductsModule = __decorate([
    Module({
        controllers: [ProductsController],
        providers: [ProductsService],
        exports: [ProductsService],
    })
], ProductsModule);
export { ProductsModule };
//# sourceMappingURL=products.module.js.map