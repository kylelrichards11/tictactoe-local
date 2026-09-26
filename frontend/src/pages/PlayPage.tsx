import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { postBotMove } from "@/client";
import { NeonBoard } from "@/components/NeonBoard";
import { Scoreboard } from "@/components/Scoreboard";
import { useKeyboardMoves } from "@/hooks/useKeyboardMoves";
import type { Outcome } from "@/lib/game";
import {
  EMPTY_BOARD,
  outcome,
  place,
  randomMove,
  seededRandom,
} from "@/lib/game";
import { usePalette } from "@/lib/palette";
import type { Difficulty, GameRecord } from "@/lib/storage";
import {
  addScore,
  HISTORY_KEY,
  HISTORY_LIMIT,
  NO_SCORES,
  SCORES_KEY,
  useStored,
} from "@/lib/storage";

type Status = "your-move" | "thinking" | "offline" | Outcome;

/** Long enough to read "Bot is thinking…" in a recording. */
export const BOT_DELAY_MS = 450;

const STATUS_TEXT: Record<Status, string> = {
  "your-move": "Your move",
  thinking: "Bot is thinking…",
  offline: "Bot is offline, start the API",
  x: "X wins",
  o: "O wins",
  draw: "Draw",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function PlayPage() {
  const [params] = useSearchParams();
  const seed = params.get("seed");
  const random = useRef(
    seed === null ? Math.random : seededRandom(Number(seed)),
  );
  const { reroll } = usePalette();

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [status, setStatus] = useState<Status>("your-move");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [game, setGame] = useState(0);
  const [scores, setScores] = useStored(SCORES_KEY, NO_SCORES);
  const [, setHistory] = useStored<GameRecord[]>(HISTORY_KEY, []);

  const finish = (final: string, result: Outcome) => {
    setStatus(result);
    setScores((s) => addScore(s, result));
    const moves = final.replace(/\./g, "").length;
    setHistory((h) =>
      [{ outcome: result, difficulty, moves, at: Date.now() }, ...h].slice(
        0,
        HISTORY_LIMIT,
      ),
    );
  };

  const botPlays = async (afterYou: string): Promise<string | null> => {
    if (difficulty === "easy") {
      return place(afterYou, randomMove(afterYou, random.current), "o");
    }
    const { data } = await postBotMove({
      body: { board: afterYou, difficulty },
    });
    return data?.board ?? null;
  };

  const play = async (index: number) => {
    if (status !== "your-move" || board[index] !== ".") {
      return;
    }
    const afterYou = place(board, index, "x");
    setBoard(afterYou);
    const youEnded = outcome(afterYou);
    if (youEnded) {
      finish(afterYou, youEnded);
      return;
    }
    setStatus("thinking");
    const [afterBot] = await Promise.all([
      botPlays(afterYou),
      wait(BOT_DELAY_MS),
    ]);
    if (afterBot === null) {
      setStatus("offline");
      return;
    }
    setBoard(afterBot);
    const botEnded = outcome(afterBot);
    if (botEnded) {
      finish(afterBot, botEnded);
    } else {
      setStatus("your-move");
    }
  };

  const newGame = () => {
    setBoard(EMPTY_BOARD);
    setStatus("your-move");
    setGame((g) => g + 1);
    reroll();
  };

  useKeyboardMoves(play, status === "your-move");

  const over = status === "x" || status === "o" || status === "draw";

  return (
    <div className="play">
      <div className="play-board">
        <NeonBoard
          key={game}
          board={board}
          onCell={play}
          disabled={status !== "your-move"}
        />
      </div>

      <aside className="panel">
        <p role="status" className={`status status-${status}`}>
          {STATUS_TEXT[status]}
        </p>

        <div className="field">
          <span className="label" id="difficulty-label">
            Difficulty
          </span>
          <div
            className="toggle"
            role="group"
            aria-labelledby="difficulty-label"
          >
            {(["easy", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                className="btn"
                aria-pressed={difficulty === d}
                disabled={status === "thinking"}
                onClick={() => setDifficulty(d)}
              >
                {d === "easy" ? "Easy" : "Hard"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={over ? "btn btn-primary pulse" : "btn btn-primary"}
          onClick={newGame}
        >
          New game
        </button>

        <Scoreboard scores={scores} onReset={() => setScores(NO_SCORES)} />
        <p className="hint">Tip: keys 1–9 play a cell.</p>
      </aside>
    </div>
  );
}
