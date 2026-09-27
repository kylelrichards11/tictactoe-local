import type { Mark } from "@/lib/game";
import { winningLine } from "@/lib/game";

import { Glyph } from "./Glyph";

type Props = {
  board: string;
  onCell?: (index: number) => void;
  disabled?: boolean;
  size?: "large" | "mini";
};

const GRID = [100, 200];
const centre = (i: number) => ({
  x: (i % 3) * 100 + 50,
  y: Math.floor(i / 3) * 100 + 50,
});

/** The glowing 3x3 board. Interactive when `onCell` is given, a picture otherwise. */
export function NeonBoard({
  board,
  onCell,
  disabled = false,
  size = "large",
}: Props) {
  const line = winningLine(board);
  const winner = line ? (board[line[0]] as Mark) : null;
  const [from, to] = line ? [centre(line[0]), centre(line[2])] : [];
  // Stretch the winning line a little past the outer cells' centres.
  const pad =
    from && to
      ? { x: (to.x - from.x) * 0.18, y: (to.y - from.y) * 0.18 }
      : null;

  return (
    <div className={`board board-${size}`} data-testid="board">
      <svg className="grid" viewBox="0 0 300 300" aria-hidden="true">
        {GRID.map((p) => (
          <g key={p}>
            <line x1={p} y1="10" x2={p} y2="290" />
            <line x1="10" y1={p} x2="290" y2={p} />
          </g>
        ))}
      </svg>
      <div className="cells">
        {[...board].map((cell, i) => {
          const glyph = cell === "." ? null : <Glyph mark={cell as Mark} />;
          if (!onCell) {
            return (
              <div key={i} className="cell">
                {glyph}
              </div>
            );
          }
          return (
            <button
              key={i}
              type="button"
              className="cell"
              aria-label={`Cell ${i + 1}`}
              disabled={disabled || cell !== "."}
              onClick={() => onCell(i)}
            >
              {glyph}
            </button>
          );
        })}
      </div>
      {from && to && pad && (
        <svg
          className={`win win-${winner}`}
          viewBox="0 0 300 300"
          data-testid="winning-line"
          aria-hidden="true"
        >
          {["tube", "core", "flare"].map((layer) => (
            <line
              key={layer}
              className={layer}
              x1={from.x - pad.x}
              y1={from.y - pad.y}
              x2={to.x + pad.x}
              y2={to.y + pad.y}
              pathLength={1}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
