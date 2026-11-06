import { Controller } from '@nestjs/common';
import { SettingsService } from './settings.service.js';

@Controller('public/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
}
