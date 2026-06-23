import { Module } from '@nestjs/common';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SimulationInfluxRepository } from './repositories/simulation-influx.repository';

@Module({
  controllers: [SimulationController],
  providers: [SimulationService, SimulationInfluxRepository],
})
export class SimulationModule {}
