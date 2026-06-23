import { http, getProjectEndpoints } from '@/lib';
import type {
  AnalyticsRange,
  LatencyHistoryResponse,
  UptimeStatsResponse,
  DowntimeEvent,
  UptimeHistoryResponse,
  TimingBreakdownResponse,
  NetworkFlowResponse,
} from '@/types/features';

export const analyticsService = {

  async getLatencyHistory(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<LatencyHistoryResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<LatencyHistoryResponse[]>(
      projectApi.ANALYTICS.LATENCY,
      { params: { range, configId } }
    );
    return response.data;
  },

  async getUptimeStats(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<UptimeStatsResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<UptimeStatsResponse[]>(
      projectApi.ANALYTICS.UPTIME,
      { params: { range, configId } }
    );
    return response.data;
  },

  async getDowntimeHistory(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<DowntimeEvent[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<DowntimeEvent[]>(
      projectApi.ANALYTICS.DOWNTIME_HISTORY,
      { params: { range, configId } }
    );
    return response.data;
  },

  async getUptimeHistory(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<UptimeHistoryResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<UptimeHistoryResponse[]>(
      projectApi.ANALYTICS.UPTIME_HISTORY,
      { params: { range, configId } }
    );
    return response.data;
  },

  async getTimingBreakdown(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<TimingBreakdownResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<TimingBreakdownResponse[]>(
      projectApi.ANALYTICS.TIMING_BREAKDOWN,
      { params: { range, configId } }
    );
    return response.data;
  },

  async getNetworkFlow(
    projectId: string,
    range?: AnalyticsRange,
    configId?: string,
  ): Promise<NetworkFlowResponse[]> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<NetworkFlowResponse[]>(
      projectApi.ANALYTICS.NETWORK_FLOW,
      { params: { range, configId } }
    );
    return response.data;
  },
};

export type AnalyticsService = typeof analyticsService;
