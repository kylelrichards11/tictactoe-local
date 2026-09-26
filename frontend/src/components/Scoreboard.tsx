import type { Scores } from "@/lib/storage";

export function Scoreboard({
  scores,
  onReset,
}: {
  scores: Scores;
  onReset: () => void;
}) {
  const tiles = [
    { label: "You", value: scores.you, tone: "x" },
    { label: "Draws", value: scores.draws, tone: "dim" },
    { label: "Bot", value: scores.bot, tone: "o" },
  ];
  return (
    <section className="scoreboard" aria-label="Scoreboard">
      <div className="scores">
        {tiles.map((t) => (
          <div key={t.label} className={`score score-${t.tone}`}>
            <span
              className="score-value"
              data-testid={`score-${t.label.toLowerCase()}`}
            >
              {t.value}
            </span>
            <span className="score-label">{t.label}</span>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Reset scores
      </button>
    </section>
  );
}
