import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GameRecord } from "./storage";
import {
  addScore,
  NO_SCORES,
  readJson,
  timeAgo,
  useStored,
  winRate,
} from "./storage";

const game = (
  outcome: GameRecord["outcome"],
  difficulty: GameRecord["difficulty"],
) => ({
  outcome,
  difficulty,
  moves: 5,
  at: 0,
});

describe("readJson", () => {
  it("returns the fallback when nothing is stored", () => {
    expect(readJson("missing", 3)).toBe(3);
  });

  it("parses what is stored", () => {
    localStorage.setItem("k", '{"a":1}');
    expect(readJson("k", {})).toEqual({ a: 1 });
  });

  it("survives corrupt JSON", () => {
    localStorage.setItem("k", "{nope");
    expect(readJson("k", "fallback")).toBe("fallback");
  });
});

describe("useStored", () => {
  it("writes values and updater results through to localStorage", () => {
    const { result } = renderHook(() => useStored("n", 1));
    expect(result.current[0]).toBe(1);

    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem("n")).toBe("5");

    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(6);
    expect(localStorage.getItem("n")).toBe("6");
  });

  it("starts from the stored value", () => {
    localStorage.setItem("n", "9");
    const { result } = renderHook(() => useStored("n", 1));
    expect(result.current[0]).toBe(9);
  });
});

describe("addScore", () => {
  it("credits the right column", () => {
    expect(addScore(NO_SCORES, "x")).toEqual({ you: 1, draws: 0, bot: 0 });
    expect(addScore(NO_SCORES, "o")).toEqual({ you: 0, draws: 0, bot: 1 });
    expect(addScore(NO_SCORES, "draw")).toEqual({ you: 0, draws: 1, bot: 0 });
  });
});

describe("winRate", () => {
  it("is the percentage of wins at that difficulty", () => {
    const games = [
      game("x", "hard"),
      game("draw", "hard"),
      game("o", "hard"),
      game("x", "easy"),
    ];
    expect(winRate(games, "hard")).toBe(33);
    expect(winRate(games, "easy")).toBe(100);
  });

  it("is null when none were played", () => {
    expect(winRate([game("x", "easy")], "hard")).toBeNull();
  });
});

describe("timeAgo", () => {
  const now = 1_000_000_000;

  it("counts seconds, minutes, hours and days", () => {
    expect(timeAgo(now - 5_000, now)).toBe("5 seconds ago");
    expect(timeAgo(now - 3 * 60_000, now)).toBe("3 minutes ago");
    expect(timeAgo(now - 2 * 3_600_000, now)).toBe("2 hours ago");
    expect(timeAgo(now - 3 * 86_400_000, now)).toBe("3 days ago");
  });

  it("says now for the current moment", () => {
    expect(timeAgo(now, now)).toBe("now");
  });
});
