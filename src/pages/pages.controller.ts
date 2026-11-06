import { Controller } from '@nestjs/common';
import { PagesService } from './pages.service.js';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}
}
