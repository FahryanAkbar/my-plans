import { Injectable } from '@nestjs/common';
import {
  DEFAULT_SIMULATION_RANGE,
  SIMULATION_RANGES,
  SimulationRange,
} from './enums/simulation-range.enum';
import { mapLatencyComparison } from './mappers/simulation.mapper';
import { SimulationInfluxRepository } from './repositories/simulation-influx.repository';
import { LatencyComparisonResult } from './entities/simulation.entity';

@Injectable()
export class SimulationService {
  constructor(
    private readonly simulationRepository: SimulationInfluxRepository,
  ) {}

  async getLatencyComparison(
    projectId: string,
    range?: string,
  ): Promise<LatencyComparisonResult[]> {
    const cleanRange = resolveRange(
      range,
      SIMULATION_RANGES,
      DEFAULT_SIMULATION_RANGE,
    );

    const [puppeteerRows, baseRows] = await Promise.all([
      this.simulationRepository.getPuppeteerRows(projectId, cleanRange),
      this.simulationRepository.getBaseRows(projectId, cleanRange),
    ]);

    return mapLatencyComparison(puppeteerRows, baseRows);
  }
}

function resolveRange(
  range: string | undefined,
  allowedRanges: readonly SimulationRange[],
  fallback: SimulationRange,
): SimulationRange {
  return allowedRanges.includes(range as SimulationRange)
    ? (range as SimulationRange)
    : fallback;
}
