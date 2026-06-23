import { http, getProjectEndpoints } from "@/lib";
import {
  NetworkTopologyResponse,
  NetworkNode,
  NetworkEdge,
  CreateNodeRequest,
  UpdateNodeRequest,
  CreateEdgeRequest,
  ImpactAnalysisResponse,
} from "@/types/features";

export const networkTopologyService = {
  async getTopology(projectId: string): Promise<NetworkTopologyResponse> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<NetworkTopologyResponse>(
      projectApi.NETWORK_TOPOLOGY.ROOT,
    );
    return response.data;
  },

  async createNode(
    projectId: string,
    data: CreateNodeRequest,
  ): Promise<NetworkNode> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.post<NetworkNode>(
      projectApi.NETWORK_TOPOLOGY.NODES,
      data,
    );
    return response.data;
  },

  async updateNode(
    projectId: string,
    nodeId: string,
    data: UpdateNodeRequest,
  ): Promise<NetworkNode> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.patch<NetworkNode>(
      projectApi.NETWORK_TOPOLOGY.NODE_DETAIL(nodeId),
      data,
    );
    return response.data;
  },

  async deleteNode(projectId: string, nodeId: string): Promise<void> {
    const projectApi = getProjectEndpoints(projectId);
    await http.delete(projectApi.NETWORK_TOPOLOGY.NODE_DETAIL(nodeId));
  },

  async createEdge(
    projectId: string,
    data: CreateEdgeRequest,
  ): Promise<NetworkEdge> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.post<NetworkEdge>(
      projectApi.NETWORK_TOPOLOGY.EDGES,
      data,
    );
    return response.data;
  },

  async deleteEdge(projectId: string, edgeId: string): Promise<void> {
    const projectApi = getProjectEndpoints(projectId);
    await http.delete(projectApi.NETWORK_TOPOLOGY.EDGE_DETAIL(edgeId));
  },

  async getImpactAnalysis(
    projectId: string,
    configId: string,
  ): Promise<ImpactAnalysisResponse> {
    const projectApi = getProjectEndpoints(projectId);
    const response = await http.get<ImpactAnalysisResponse>(
      projectApi.NETWORK_TOPOLOGY.IMPACT(configId),
    );
    return response.data;
  },
};

export type NetworkTopologyService = typeof networkTopologyService;
