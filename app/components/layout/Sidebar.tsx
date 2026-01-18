import { GripVertical } from "lucide-react";
import { ChordItem } from "@/app/types";

interface Props {
  activeTab: "explorer" | "search";
  palette: ChordItem[];
  onPaletteItemDragStart: (
    chord: ChordItem,
    clientX: number,
    clientY: number
  ) => void;
}

export default function Sidebar({
  activeTab,
  palette,
  onPaletteItemDragStart,
}: Props) {
  return (
    <aside className="w-64 bg-[#252526] flex flex-col border-r border-[#3e3e42] z-20 shadow-xl">
      <div className="h-9 px-4 flex items-center text-xs font-bold tracking-wider uppercase bg-[#252526]">
        {activeTab === "explorer" ? "Explorer" : "Chord Palette"}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === "search" && (
          <>
            <div className="text-xs text-gray-500 mb-2">Drag to canvas</div>
            {palette.map((chord) => (
              <div
                key={chord.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPaletteItemDragStart(chord, e.clientX, e.clientY);
                }}
                className={`
                  h-10 flex items-center justify-between px-3 rounded cursor-grab active:cursor-grabbing
                  shadow-sm border border-transparent hover:border-white/50 transition-all
                  ${chord.color} text-white font-bold text-sm select-none
                `}
              >
                <span>{chord.label}</span>
                <GripVertical className="w-4 h-4 opacity-50" />
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
