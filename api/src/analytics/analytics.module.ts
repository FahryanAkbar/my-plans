import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsInfluxRepository } from './repositories/analytics-influx.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsInfluxRepository],
  exports: [AnalyticsInfluxRepository],
})
export class AnalyticsModule {}
