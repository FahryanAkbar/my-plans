import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SimulationModule } from './simulation/simulation.module';
import { BatchModule } from './batch/batch.module';
import { DigitalTwinModule } from './digital-twin/digital-twin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(configService.get<number>('DATABASE_PORT', 5433)),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'monitoring'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: Number(configService.get<number>('REDIS_PORT', 6379)),
        },
      }),
    }),

    ProjectsModule,
    MonitoringModule,
    AnalyticsModule,
    SimulationModule,
    BatchModule,
    DigitalTwinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
