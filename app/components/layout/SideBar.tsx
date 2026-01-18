import { ChevronDown, GripVertical } from "lucide-react";
import { ChordItem } from "@/app/types";

interface Props {
  activeTab: "explorer" | "search";
  palette: ChordItem[];
}

export default function Sidebar({ activeTab, palette }: Props) {
  const handleDragStart = (e: React.DragEvent, chord: ChordItem) => {
    e.dataTransfer.setData("chordData", JSON.stringify(chord));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-64 bg-[#252526] flex flex-col border-r border-[#3e3e42]">
      <div className="h-9 px-4 flex items-center text-xs font-bold tracking-wider uppercase">
        {activeTab === "explorer" ? "Explorer" : "Chord Palette"}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "explorer" ? (
          <div>
            <div className="flex items-center cursor-pointer py-1 hover:bg-white/5">
              <ChevronDown className="w-4 h-4 mr-1" />
              <span className="font-bold text-xs">VS-CHORDS-PROJECT</span>
            </div>
            <div className="pl-4 mt-1 text-xs opacity-80 space-y-1">
              <div>🎵 main.chord</div>
              <div>⚙️ config.json</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 px-2">
              Drag chords to canvas
            </div>
            {palette.map((chord) => (
              <div
                key={chord.label}
                draggable
                onDragStart={(e) => handleDragStart(e, chord)}
                className="flex items-center p-2 bg-[#333333] hover:bg-[#2a2d2e] rounded cursor-grab active:cursor-grabbing border border-[#3e3e42]"
              >
                <GripVertical className="w-4 h-4 text-gray-500 mr-2" />
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${chord.color}`}
                ></div>
                <span className="font-mono font-bold">{chord.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
