/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeType = 'Client' | 'Compute' | 'Database' | 'Queue' | 'Cache' | 'Network' | 'Storage';

export interface ChallengeNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  isAnchor?: boolean;
  isTrap?: boolean;
  trapExplanation?: string;
  referenceJustification: string;
  // For preplaced anchors
  x?: number;
  y?: number;
}

export interface ConnectionRequirement {
  from: string;
  to: string;
  label?: string;
}

export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  objective: string;
  hints: string[]; // 3-step hint ladder
  anchors: ChallengeNode[];
  palette: ChallengeNode[];
  requiredNodes: string[]; // Match IDs of expected nodes
  requiredConnections: ConnectionRequirement[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  stages: Stage[];
}

export interface CanvasNode {
  id: string; // Instance ID on canvas
  templateId: string; // Original ID from ChallengeNode
  type: NodeType;
  label: string;
  description: string;
  x: number;
  y: number;
  width?: number; // Custom dynamic size width
  height?: number; // Custom dynamic size height
  isAnchor?: boolean;
  isTrap?: boolean;
  trapExplanation?: string;
  referenceJustification: string;
  justificationText: string;
  answers: Record<string, string>; // Maps question prompt -> user response
}

export interface CanvasConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface StageFeedback {
  matched: string[];
  missing: string[];
  traps: string[];
  extras: string[];
  connectionsResult: {
    matched: string[];
    missing: string[];
  };
}

export interface ProjectState {
  currentChallengeId: string;
  currentStageId: number;
  completedStages: number[];
  nodes: Record<number, CanvasNode[]>; // stageId -> nodes
  connections: Record<number, CanvasConnection[]>; // stageId -> connections
  justifications: Record<string, string>; // nodeInstanceId -> text
  answers: Record<string, Record<string, string>>; // nodeInstanceId -> { question -> answer }
}
