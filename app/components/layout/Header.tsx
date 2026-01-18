import { Music, Minus, Square, X } from "lucide-react";

export default function Header() {
  return (
    <header className="h-8 bg-[#3c3c3c] flex items-center justify-between px-2 select-none">
      <div className="flex items-center space-x-4">
        <Music className="w-4 h-4 text-blue-400" />
        <div className="flex space-x-3 text-xs opacity-80 cursor-default">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Run</span>
        </div>
      </div>
      <div className="text-xs opacity-60">vs-chords - visual_mode</div>
      <div className="flex items-center space-x-2">
        <Minus className="w-4 h-4" />
        <Square className="w-3 h-3" />
        <X className="w-4 h-4 hover:bg-red-500 cursor-pointer" />
      </div>
    </header>
  );
}
