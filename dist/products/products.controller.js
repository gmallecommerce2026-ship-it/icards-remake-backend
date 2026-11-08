import { __decorate, __metadata } from "tslib";
import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service.js';
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
};
ProductsController = __decorate([
    Controller('products'),
    __metadata("design:paramtypes", [ProductsService])
], ProductsController);
export { ProductsController };
//# sourceMappingURL=products.controller.js.map