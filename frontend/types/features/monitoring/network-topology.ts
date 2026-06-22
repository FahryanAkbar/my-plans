export enum NodeType {
  SERVICE = 'service',
  DATABASE = 'database',
  CDN = 'cdn',
  GATEWAY = 'gateway',
  EXTERNAL = 'external',
}

export enum RelationType {
  DEPENDS_ON = 'depends_on',
  CALLS = 'calls',
  PROXIES_TO = 'proxies_to',
}

export interface NetworkNode {
  id: string;
  projectId: string;
  configId?: string;
  label: string;
  nodeType: NodeType;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkEdge {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  createdAt: string;
}

export interface NetworkTopologyResponse {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface CreateNodeRequest {
  label: string;
  nodeType?: NodeType;
  configId?: string;
  x?: number;
  y?: number;
}

export interface UpdateNodeRequest {
  label?: string;
  nodeType?: NodeType;
  x?: number;
  y?: number;
}

export interface CreateEdgeRequest {
  sourceId: string;
  targetId: string;
  relationType?: RelationType;
}

export interface ImpactedNode {
  nodeId: string;
  label: string;
  depth: number;
}

export interface ImpactAnalysisResponse {
  sourceNodeId: string;
  sourceLabel: string;
  impactedNodes: ImpactedNode[];
}
