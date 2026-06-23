import { NotFoundException } from '@nestjs/common';
import { NetworkNode } from '../entities/network-node.entity';
import { NetworkEdge } from '../entities/network-edge.entity';

export interface ImpactAnalysisResult {
  sourceNodeId: string;
  sourceLabel: string;
  impactedNodes: Array<{ nodeId: string; label: string; depth: number }>;
}

export function mapImpactAnalysis(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  configId: string,
): ImpactAnalysisResult {
  // 1. Cari source node berdasarkan configId
  const sourceNode = nodes.find((n) => n.configId === configId);
  if (!sourceNode) {
    throw new NotFoundException(
      `No network node found for configId: ${configId}`,
    );
  }

  // 2. Bangun Adjacency List: sourceId -> [targetIds]
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.sourceId)) {
      adjacency.set(edge.sourceId, []);
    }
    adjacency.get(edge.sourceId)!.push(edge.targetId);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 3. BFS Traversal
  const visited = new Set<string>([sourceNode.id]);
  const queue: Array<{ nodeId: string; depth: number }> = [
    { nodeId: sourceNode.id, depth: 0 },
  ];
  const impactedNodes: ImpactAnalysisResult['impactedNodes'] = [];

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    const neighbors = adjacency.get(nodeId) ?? [];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const neighborNode = nodeMap.get(neighborId);
        if (neighborNode) {
          impactedNodes.push({
            nodeId: neighborId,
            label: neighborNode.label,
            depth: depth + 1,
          });
          queue.push({ nodeId: neighborId, depth: depth + 1 });
        }
      }
    }
  }

  return {
    sourceNodeId: sourceNode.id,
    sourceLabel: sourceNode.label,
    impactedNodes,
  };
}
