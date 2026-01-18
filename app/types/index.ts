export type NodeType = "start" | "chord";

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  color?: string;
}

export interface Connection {
  id: string;
  source: string; // 시작 노드 ID
  target: string; // 끝 노드 ID
}

export interface ChordItem {
  label: string;
  color: string;
}
