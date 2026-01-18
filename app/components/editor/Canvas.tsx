"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { NodeData, Connection, ChordItem } from "@/app/types";
import NodeItem from "./NodeItem";

interface Props {
  nodes: NodeData[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  pendingDragNode: {
    chord: ChordItem;
    startX: number;
    startY: number;
  } | null;
  onPendingDragConsumed: () => void;
}

const NODE_SIZE = 96;

export default function Canvas({
  nodes,
  setNodes,
  connections,
  setConnections,
  pendingDragNode,
  onPendingDragConsumed,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // 1. Viewport State
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);

  // 2. Interaction State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 3. Connection State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(
    null
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // --- Helper: Screen to World ---
  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.x) / viewport.zoom,
        y: (clientY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport.x, viewport.y, viewport.zoom]
  );

  // --- 사이드바에서 드래그 시작 시 노드 생성 및 드래그 시작 ---
  useEffect(() => {
    if (!pendingDragNode) return;

    const { chord, startX, startY } = pendingDragNode;
    const worldPos = screenToWorld(startX, startY);
    const newNodeId = `node-${Date.now()}`;

    // 노드 생성 (마우스 중심에 위치)
    const newNode: NodeData = {
      id: newNodeId,
      type: "chord",
      label: chord.label,
      color: chord.color,
      x: worldPos.x - NODE_SIZE / 2,
      y: worldPos.y - NODE_SIZE / 2,
    };

    setNodes((prev) => [...prev, newNode]);

    // 드래그 상태 시작 (노드 중앙을 잡고 있는 것처럼)
    setDragOffset({ x: NODE_SIZE / 2, y: NODE_SIZE / 2 });
    setDraggingNodeId(newNodeId);

    // pending 상태 소비 완료
    onPendingDragConsumed();
  }, [pendingDragNode, screenToWorld, setNodes, onPendingDragConsumed]);

  // --- Logic ---
  const handleNodeDragStart = (e: React.MouseEvent, node: NodeData) => {
    e.stopPropagation();
    if (connectingSourceId) return; // 연결 중엔 드래그 금지

    const mouseWorldPos = screenToWorld(e.clientX, e.clientY);
    setDragOffset({
      x: mouseWorldPos.x - node.x,
      y: mouseWorldPos.y - node.y,
    });
    setDraggingNodeId(node.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingNodeId) {
      if (connectingSourceId) {
        // 연결 중 캔버스 클릭 시 연결 취소
        setConnectingSourceId(null);
      } else {
        setIsPanning(true);
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMousePos(worldPos);

      if (isPanning) {
        setViewport((prev) => ({
          ...prev,
          x: prev.x + e.movementX,
          y: prev.y + e.movementY,
        }));
        return;
      }

      if (draggingNodeId) {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== draggingNodeId) return node;
            let newX = worldPos.x - dragOffset.x;
            let newY = worldPos.y - dragOffset.y;

            const SNAP_DIST = 20;
            prev.forEach((target) => {
              if (target.id === draggingNodeId) return;
              // 수직 정렬 (같은 X)
              if (Math.abs(newX - target.x) < SNAP_DIST) newX = target.x;
              // 수평 정렬 (같은 Y)
              if (Math.abs(newY - target.y) < SNAP_DIST) newY = target.y;
              // 간격 0 스냅 (딱 붙음) - 드래그 노드가 타겟 오른쪽에 붙음
              if (Math.abs(newX - (target.x + NODE_SIZE)) < SNAP_DIST)
                newX = target.x + NODE_SIZE;
              // 간격 0 스냅 - 드래그 노드가 타겟 왼쪽에 붙음
              if (Math.abs(newX + NODE_SIZE - target.x) < SNAP_DIST)
                newX = target.x - NODE_SIZE;
            });
            return { ...node, x: newX, y: newY };
          })
        );
      }
    },
    [isPanning, draggingNodeId, dragOffset, screenToWorld, setNodes]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
    // connectingSourceId는 NodeItem의 onConnectEnd에서 처리하므로 여기서는 제거하지 않음
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getPath = (x1: number, y1: number, x2: number, y2: number) => {
    const startX = x1 + NODE_SIZE;
    const startY = y1 + NODE_SIZE / 2;
    const endX = x2;
    const endY = y2 + NODE_SIZE / 2;

    const dist = Math.abs(endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${startX + dist} ${startY}, ${
      endX - dist
    } ${endY}, ${endX} ${endY}`;
  };

  return (
    <main className="flex-1 flex flex-col relative bg-[#1e1e1e] overflow-hidden">
      <div className="h-9 flex items-center justify-between bg-[#252526] border-b border-[#252526] px-3 z-10 select-none">
        <div className="flex items-center text-white text-xs bg-[#1e1e1e] px-3 py-1 border-t-2 border-blue-500">
          <span className="mr-2">🎵</span> canvas_editor{" "}
          <X className="w-3 h-3 ml-2" />
        </div>
        <div className="text-xs text-gray-500">
          Zoom: {(viewport.zoom * 100).toFixed(0)}%
        </div>
      </div>

      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        className="flex-1 relative cursor-crosshair origin-top-left overflow-hidden"
      >
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="absolute inset-[-2000%] opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#888 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <svg className="absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px] overflow-visible pointer-events-none z-0">
            {/* 기존 연결선 */}
            {connections.map((conn) => {
              const start = nodes.find((n) => n.id === conn.source);
              const end = nodes.find((n) => n.id === conn.target);
              if (!start || !end) return null;
              return (
                <path
                  key={conn.id}
                  d={getPath(start.x, start.y, end.x, end.y)}
                  stroke="#569cd6"
                  strokeWidth="3"
                  fill="none"
                />
              );
            })}

            {/* 드래그 중인 가상선 */}
            {connectingSourceId &&
              (() => {
                const start = nodes.find((n) => n.id === connectingSourceId);
                if (!start) return null;
                // 마우스 위치로 선 그리기 (좌표 보정)
                return (
                  <path
                    d={getPath(
                      start.x,
                      start.y,
                      mousePos.x - 20,
                      mousePos.y - NODE_SIZE / 2
                    )}
                    stroke="#569cd6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    fill="none"
                  />
                );
              })()}
          </svg>

          {nodes.map((node) => {
            // 인접 노드 체크: 왼쪽/오른쪽에 딱 붙어있는 노드가 있는지
            const hasLeftNeighbor = nodes.some(
              (other) =>
                other.id !== node.id &&
                other.x + NODE_SIZE === node.x &&
                Math.abs(other.y - node.y) < NODE_SIZE
            );
            const hasRightNeighbor = nodes.some(
              (other) =>
                other.id !== node.id &&
                node.x + NODE_SIZE === other.x &&
                Math.abs(other.y - node.y) < NODE_SIZE
            );

            return (
            <NodeItem
              key={node.id}
              node={node}
              hideLeftPort={hasLeftNeighbor}
              hideRightPort={hasRightNeighbor}
              onStartDrag={(e) => handleNodeDragStart(e, node)}
              onStartConnect={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setConnectingSourceId(node.id);
              }}
              onConnectEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (connectingSourceId && connectingSourceId !== node.id) {
                  // 중복 연결 체크
                  const exists = connections.some(
                    (c) =>
                      c.source === connectingSourceId && c.target === node.id
                  );
                  if (!exists) {
                    setConnections((prev) => [
                      ...prev,
                      {
                        id: `c-${Date.now()}`,
                        source: connectingSourceId,
                        target: node.id,
                      },
                    ]);
                  }
                  setConnectingSourceId(null);
                }
              }}
              onDelete={() => {
                setNodes((prev) => prev.filter((n) => n.id !== node.id));
                setConnections((prev) =>
                  prev.filter(
                    (c) => c.source !== node.id && c.target !== node.id
                  )
                );
              }}
            />
          );
          })}
        </div>
      </div>
    </main>
  );
}
