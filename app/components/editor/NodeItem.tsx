import { Play, Trash2 } from "lucide-react";
import { NodeData } from "@/app/types";

interface Props {
  node: NodeData;
  onStartDrag: (e: React.MouseEvent) => void;
  onStartConnect: (e: React.MouseEvent) => void;
  onConnectEnd: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export default function NodeItem({
  node,
  onStartDrag,
  onStartConnect,
  onConnectEnd,
  onDelete,
}: Props) {
  const sizeClass = "w-24 h-24";

  return (
    <div
      onMouseDown={onStartDrag}
      style={{ left: node.x, top: node.y }}
      className={`
        absolute flex flex-col items-center justify-center p-2
        ${sizeClass} 
        ${
          node.type === "start"
            ? "rounded-full border-4 border-[#1e1e1e] ring-2 ring-green-500 shadow-[0_0_20px_rgba(0,255,0,0.4)]"
            : "rounded-xl shadow-lg"
        }
        ${
          node.color
        } text-white font-bold text-sm cursor-grab active:cursor-grabbing select-none group 
        hover:scale-105 transition-transform z-10
      `}
    >
      <div className="flex items-center text-center leading-tight pointer-events-none break-words w-full justify-center">
        {node.type === "start" ? (
          <Play className="fill-current w-8 h-8" />
        ) : (
          node.label
        )}
      </div>

      {/* Input Port (왼쪽) - 투명 히트박스 확대 */}
      {node.type !== "start" && (
        <div
          onMouseUp={onConnectEnd}
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-crosshair z-50"
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-[#1e1e1e] hover:bg-white transition-all" />
        </div>
      )}

      {/* Output Port (오른쪽) - 투명 히트박스 확대 */}
      <div
        onMouseDown={onStartConnect}
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-crosshair z-50
          ${node.type === "start" ? "-right-4" : "-right-4"}
        `}
      >
        <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-[#1e1e1e] hover:bg-blue-400 transition-all" />
      </div>

      {node.type !== "start" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 z-50"
        >
          <Trash2 className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}
