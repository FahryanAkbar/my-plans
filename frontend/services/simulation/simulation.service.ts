import { http, getProjectEndpoints } from "@/lib";
import {
  LatencyComparisonResponse,
  AnalyticsRange,
  QosAnalysisResponse,
} from "@/types/features";

export const simulationService = {
  async getLatencyComparison(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<LatencyComparisonResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<LatencyComparisonResponse[]>(
      projectApi.SIMULATION.LATENCY_COMPARISON,
      { params: { range, configId } },
    );
    return response.data;
  },

  async getQosAnalysis(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<QosAnalysisResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<QosAnalysisResponse[]>(
      projectApi.SIMULATION.QOS,
      { params: { range, configId } },
    );
    return response.data;
  },
};

export type SimulationService = typeof simulationService;
