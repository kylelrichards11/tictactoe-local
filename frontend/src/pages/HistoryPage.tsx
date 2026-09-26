import { Link } from "react-router-dom";

import type { GameRecord } from "@/lib/storage";
import { HISTORY_KEY, timeAgo, useStored, winRate } from "@/lib/storage";

const RESULT = { x: "Win", o: "Loss", draw: "Draw" } as const;

const percent = (value: number | null) => (value === null ? "–" : `${value}%`);

export function HistoryPage() {
  const [games, setGames] = useStored<GameRecord[]>(HISTORY_KEY, []);

  if (games.length === 0) {
    return (
      <div className="empty">
        <div className="empty-ring" aria-hidden="true" />
        <h1 className="title">No games yet</h1>
        <p className="lede">Every game you finish lands here.</p>
        <Link to="/" className="btn btn-primary">
          Play a game
        </Link>
      </div>
    );
  }

  const wins = games.filter((g) => g.outcome === "x").length;

  return (
    <div className="history">
      <h1 className="title">History</h1>
      <dl className="facts stats">
        <div>
          <dt>Games</dt>
          <dd data-testid="games-played">{games.length}</dd>
        </div>
        <div>
          <dt>Wins</dt>
          <dd>{wins}</dd>
        </div>
        <div>
          <dt>Win rate vs Hard</dt>
          <dd data-testid="hard-win-rate">{percent(winRate(games, "hard"))}</dd>
        </div>
        <div>
          <dt>Win rate vs Easy</dt>
          <dd>{percent(winRate(games, "easy"))}</dd>
        </div>
      </dl>
      <table className="games">
        <thead>
          <tr>
            <th>Result</th>
            <th>Bot</th>
            <th>Moves</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.at}>
              <td className={`result result-${g.outcome}`}>
                {RESULT[g.outcome]}
              </td>
              <td>{g.difficulty === "hard" ? "Hard" : "Easy"}</td>
              <td>{g.moves}</td>
              <td className="dim">{timeAgo(g.at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setGames([])}
      >
        Clear history
      </button>
    </div>
  );
}
