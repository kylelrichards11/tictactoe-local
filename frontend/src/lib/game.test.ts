import { describe, expect, it } from "vitest";

import {
  emptyCells,
  evaluationText,
  isBoard,
  outcome,
  place,
  randomMove,
  seededRandom,
  turn,
  winningLine,
} from "./game";

describe("isBoard", () => {
  it("accepts nine cells of x, o and .", () => {
    expect(isBoard("xo.xo.xo.")).toBe(true);
  });

  it("rejects the wrong length or letters", () => {
    expect(isBoard("xo")).toBe(false);
    expect(isBoard("xo.xo.xoz")).toBe(false);
  });
});

describe("winningLine", () => {
  it("finds a completed row", () => {
    expect(winningLine("xxxoo....")).toEqual([0, 1, 2]);
  });

  it("finds a diagonal for O", () => {
    expect(winningLine("oxxxo...o")).toEqual([0, 4, 8]);
  });

  it("returns null when nobody has three", () => {
    expect(winningLine("xo.......")).toBeNull();
  });
});

describe("outcome", () => {
  it("names the winner", () => {
    expect(outcome("xxxoo....")).toBe("x");
    expect(outcome("ooox.xx..")).toBe("o");
  });

  it("calls a full board with no line a draw", () => {
    expect(outcome("xoxxoooxx")).toBe("draw");
  });

  it("is null while the game is on", () => {
    expect(outcome("x........")).toBeNull();
  });
});

describe("turn", () => {
  it("starts with X and alternates", () => {
    expect(turn(".........")).toBe("x");
    expect(turn("x........")).toBe("o");
    expect(turn("xo.......")).toBe("x");
  });
});

describe("emptyCells and place", () => {
  it("lists the open cells", () => {
    expect(emptyCells("xo.xo.xo.")).toEqual([2, 5, 8]);
  });

  it("places a mark without touching the rest", () => {
    expect(place(".........", 4, "x")).toBe("....x....");
  });
});

describe("seededRandom", () => {
  it("repeats the same stream for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("stays in [0, 1)", () => {
    const random = seededRandom(7);
    const values = Array.from({ length: 50 }, random);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });
});

describe("randomMove", () => {
  it("maps the random number onto the open cells", () => {
    expect(randomMove("xo.xo.xo.", () => 0)).toBe(2);
    expect(randomMove("xo.xo.xo.", () => 0.5)).toBe(5);
    expect(randomMove("xo.xo.xo.", () => 0.99)).toBe(8);
  });
});

describe("evaluationText", () => {
  it("words every score", () => {
    expect(evaluationText(1)).toBe("X wins");
    expect(evaluationText(-1)).toBe("O wins");
    expect(evaluationText(0)).toBe("Draw");
    expect(evaluationText(null)).toBe("Undecided");
  });
});
