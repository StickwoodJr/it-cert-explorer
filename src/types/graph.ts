import { CertLevel, EntityStatus } from './models';

export interface GraphNode {
  id: string; // e.g. "cert:ccna"
  label: string; // e.g. "CCNA"
  fullName: string;
  vendorId: string;
  vendorName: string;
  domains: string[]; // ["networking"]
  level: CertLevel;
  status: EntityStatus;
  score: number;
  scoreBreakdown?: {
    marketValue: number;
    demand: number;
    rigor: number;
    community: number;
  };
  computedCostUsd: number;
  computedCostCad: number;
  isCostRange: boolean;
  costDisplayUsd: string;
  costDisplayCad: string;
  renewalMonths: number;
  examSummary: string;
  officialUrl: string;
  // Position hints for DAG
  rank?: number;
}

export interface GraphEdge {
  id: string;
  source: string; // "cert:ccna"
  target: string; // "cert:ccnp-enterprise"
  type: 'required' | 'recommended' | 'alternative';
  label?: string;
  groupId?: string;
}

export interface GraphExport {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    generatedAt: string;
    cadExchangeRate: number;
  };
}
