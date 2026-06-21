import { Injectable } from '@nestjs/common';
import { NetworkTopologyRepository } from './repositories/network-topology.repository';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { NetworkNode } from './entities/network-node.entity';
import { NetworkEdge } from './entities/network-edge.entity';
import {
  mapImpactAnalysis,
  ImpactAnalysisResult,
} from './mappers/network-topology.mapper';

export interface TopologyGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

@Injectable()
export class NetworkTopologyService {
  constructor(private readonly topologyRepository: NetworkTopologyRepository) {}

  async getTopology(projectId: string): Promise<TopologyGraph> {
    const [nodes, edges] = await Promise.all([
      this.topologyRepository.getNodesByProject(projectId),
      this.topologyRepository.getEdgesByProject(projectId),
    ]);
    return { nodes, edges };
  }

  createNode(projectId: string, dto: CreateNodeDto): Promise<NetworkNode> {
    return this.topologyRepository.createNode(projectId, dto);
  }

  updateNode(id: string, dto: UpdateNodeDto): Promise<NetworkNode | null> {
    return this.topologyRepository.updateNode(id, dto);
  }

  async deleteNode(projectId: string, nodeId: string): Promise<void> {
    await this.topologyRepository.deleteNode(nodeId);
  }

  createEdge(projectId: string, dto: CreateEdgeDto): Promise<NetworkEdge> {
    return this.topologyRepository.createEdge(projectId, dto);
  }

  async deleteEdge(projectId: string, edgeId: string): Promise<void> {
    await this.topologyRepository.deleteEdge(edgeId);
  }

  async getImpactedNodes(
    projectId: string,
    configId: string,
  ): Promise<ImpactAnalysisResult> {
    const [nodes, edges] = await Promise.all([
      this.topologyRepository.getNodesByProject(projectId),
      this.topologyRepository.getEdgesByProject(projectId),
    ]);

    return mapImpactAnalysis(nodes, edges, configId);
  }
}
