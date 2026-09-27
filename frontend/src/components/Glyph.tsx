import type { Mark } from "@/lib/game";

/** One neon X or O. Each stroke is drawn twice: a coloured tube and a hot core. */
export function Glyph({ mark }: { mark: Mark }) {
  const layers = ["tube", "core"] as const;
  return (
    <svg
      className={`glyph glyph-${mark}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {layers.map((layer) =>
        mark === "x" ? (
          <g key={layer} className={layer}>
            <line
              className="stroke"
              x1="26"
              y1="26"
              x2="74"
              y2="74"
              pathLength={1}
            />
            <line
              className="stroke stroke-2"
              x1="74"
              y1="26"
              x2="26"
              y2="74"
              pathLength={1}
            />
          </g>
        ) : (
          <g key={layer} className={layer}>
            <circle
              className="stroke"
              cx="50"
              cy="50"
              r="25"
              pathLength={1}
              transform="rotate(-90 50 50)"
            />
          </g>
        ),
      )}
    </svg>
  );
}
