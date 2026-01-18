"use client";

import React, { useState } from "react";
import Header from "@/app/components/layout/Header";
import ActivityBar from "@/app/components/layout/ActivityBar";
import Sidebar from "@/app/components/layout/Sidebar";
import Canvas from "@/app/components/editor/Canvas";
import { NodeData, ChordItem, Connection } from "@/app/types";

const CHORD_PALETTE: ChordItem[] = [
  { label: "C Maj7", color: "bg-green-600" },
  { label: "A min7", color: "bg-yellow-600" },
  { label: "D min9", color: "bg-blue-600" },
  { label: "G 7alt", color: "bg-red-600" },
  { label: "F #m7b5", color: "bg-purple-600" },
  { label: "B 7", color: "bg-orange-600" },
];

export default function VSChordsApp() {
  const [activeTab, setActiveTab] = useState<"explorer" | "search">("search");

  // 1. 노드 상태
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: "start",
      type: "start",
      label: "START",
      x: 100,
      y: 300,
      color: "bg-gray-700",
    },
  ]);

  // 2. 연결선 상태 (이게 꼭 있어야 합니다!)
  const [connections, setConnections] = useState<Connection[]>([]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#1e1e1e] text-[#cccccc] font-sans text-sm overflow-hidden select-none">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeTab={activeTab} onTabChange={setActiveTab} />
        <Sidebar activeTab={activeTab} palette={CHORD_PALETTE} />

        {/* Canvas에 connections와 setConnections를 반드시 전달해야 함 */}
        <Canvas
          nodes={nodes}
          setNodes={setNodes}
          connections={connections}
          setConnections={setConnections}
        />
      </div>

      <footer className="h-6 bg-[#007acc] flex items-center px-3 text-white text-xs z-20 justify-between">
        <div className="flex space-x-4">
          <span>main*</span>
          <span>Nodes: {nodes.length}</span>
        </div>
        <div>Visual Mode</div>
      </footer>
    </div>
  );
}
