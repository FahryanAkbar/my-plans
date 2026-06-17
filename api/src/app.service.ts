import { Injectable } from '@nestjs/common';

export interface ApiMetadata {
  name: string;
  version: string;
  status: string;
  uptime: number;
  timestamp: string;
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getApiMetadata(): ApiMetadata {
    return {
      name: 'My Plans API Gateway',
      version: '1.0.0',
      status: 'UP',
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}
