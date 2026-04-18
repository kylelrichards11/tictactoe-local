import { cn } from "@/lib/utils";

interface BoardDisplayProps {
  board: string;
  size?: "sm" | "md";
}

export function BoardDisplay({ board, size = "md" }: BoardDisplayProps) {
  const cellSize = size === "sm" ? "h-10 w-10 text-lg" : "h-16 w-16 text-2xl";

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from(board).map((cell, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-center border rounded-sm font-bold",
            cellSize,
            cell === "x" && "text-blue-600",
            cell === "o" && "text-red-600",
          )}
        >
          {cell === "." ? "" : cell.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
