import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoardInputProps {
  value: string;
  onChange: (board: string) => void;
  disabled?: boolean;
}

const CYCLE: Record<string, string> = { ".": "x", x: "o", o: "." };

export function BoardInput({ value, onChange, disabled }: BoardInputProps) {
  const handleClick = (index: number) => {
    if (disabled) {
      return;
    }
    const current = value[index];
    const next = CYCLE[current] ?? ".";
    onChange(value.slice(0, index) + next + value.slice(index + 1));
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="grid grid-cols-3 gap-1">
        {Array.from(value).map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={disabled}
            className={cn(
              "flex h-16 w-16 items-center justify-center border-2 rounded-md text-2xl font-bold transition-colors",
              "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed",
              cell === "x" && "text-blue-600",
              cell === "o" && "text-red-600",
            )}
          >
            {cell === "." ? "" : cell.toUpperCase()}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(".........")}
        disabled={disabled}
      >
        Clear
      </Button>
    </div>
  );
}
