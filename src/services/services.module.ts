import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './schemas/service.schema.js';
import { ServiceRequest } from './schemas/service-request.schema.js';
import { ServicesController, ServiceRequestsController } from './services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceRequest])],
  controllers: [ServicesController, ServiceRequestsController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
