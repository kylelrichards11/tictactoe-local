import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NEON, randomPair, usePalette } from "./palette";

/** A random() that replays the given values in order. */
const replay = (...values: number[]) => {
  let i = 0;
  return () => values[i++];
};

// Indexes into the hue list: cyan 0, magenta 0.2, lime 0.4, orange 0.6, yellow 0.8.
describe("randomPair", () => {
  it("gives X and O two different hues", () => {
    expect(randomPair(replay(0, 0.2))).toEqual({ x: "cyan", o: "magenta" });
  });

  it("rolls again on the same hue twice", () => {
    expect(randomPair(replay(0, 0, 0.4, 0))).toEqual({ x: "lime", o: "cyan" });
  });

  it("never pairs neighbouring hues", () => {
    expect(randomPair(replay(0.6, 0.8, 0.4, 0.8, 0.8, 0.2))).toEqual({
      x: "yellow",
      o: "magenta",
    });
  });

  it("never repeats the pair it is replacing", () => {
    const current = { x: "cyan", o: "magenta" } as const;
    expect(randomPair(replay(0, 0.2, 0.2, 0), current)).toEqual({
      x: "magenta",
      o: "cyan",
    });
  });

  it("only ever returns known neon hues", () => {
    const pair = randomPair();
    expect(Object.keys(NEON)).toContain(pair.x);
    expect(Object.keys(NEON)).toContain(pair.o);
  });
});

describe("usePalette", () => {
  it("falls back to cyan against magenta", () => {
    const { result } = renderHook(() => usePalette());
    expect(result.current.pair).toEqual({ x: "cyan", o: "magenta" });
    expect(result.current.reroll()).toBeUndefined();
  });
});
