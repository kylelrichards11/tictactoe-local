import { useCallback, useState } from "react";

import type { Outcome } from "./game";

export type Difficulty = "easy" | "hard";
export type Scores = { you: number; draws: number; bot: number };
export type GameRecord = {
  outcome: Outcome;
  difficulty: Difficulty;
  moves: number;
  at: number;
};

export const SCORES_KEY = "ttt.scores";
export const HISTORY_KEY = "ttt.history";
export const HISTORY_LIMIT = 25;
export const NO_SCORES: Scores = { you: 0, draws: 0, bot: 0 };

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** useState that mirrors itself into localStorage. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readJson(key, fallback));
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key],
  );
  return [value, update] as const;
}

export function addScore(scores: Scores, result: Outcome): Scores {
  if (result === "x") {
    return { ...scores, you: scores.you + 1 };
  }
  if (result === "o") {
    return { ...scores, bot: scores.bot + 1 };
  }
  return { ...scores, draws: scores.draws + 1 };
}

export function winRate(
  games: GameRecord[],
  difficulty: Difficulty,
): number | null {
  const played = games.filter((g) => g.difficulty === difficulty);
  if (played.length === 0) {
    return null;
  }
  const wins = played.filter((g) => g.outcome === "x").length;
  return Math.round((wins / played.length) * 100);
}

/** "2 minutes ago", for the history table. */
export function timeAgo(at: number, now: number = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const seconds = Math.round((at - now) / 1000);
  if (seconds > -60) {
    return rtf.format(seconds, "second");
  }
  const minutes = Math.round(seconds / 60);
  if (minutes > -60) {
    return rtf.format(minutes, "minute");
  }
  const hours = Math.round(minutes / 60);
  if (hours > -24) {
    return rtf.format(hours, "hour");
  }
  return rtf.format(Math.round(hours / 24), "day");
}
