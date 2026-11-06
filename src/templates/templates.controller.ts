import { Controller } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';

@Controller('invitation-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}
}
