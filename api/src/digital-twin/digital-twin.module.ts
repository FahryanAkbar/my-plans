import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DigitalTwinService } from './digital-twin.service';
import { DigitalTwinGateway } from './digital-twin.gateway';
import { DailySummary } from '../batch/entities/summary.entity';
import { Project } from '../projects/entities/project.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailySummary, Project]),
    ScheduleModule.forRoot(),
    AnalyticsModule,
  ],
  providers: [DigitalTwinService, DigitalTwinGateway],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
