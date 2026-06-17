import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiMetadata } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiMetadata(): ApiMetadata {
    return this.appService.getApiMetadata();
  }
}
