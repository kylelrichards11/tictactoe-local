/** Board helpers shared by the pages. A board is 9 chars of "x", "o" or ".". */

export type Mark = "x" | "o";
export type Outcome = Mark | "draw";
export type Cell = Mark | ".";

export const EMPTY_BOARD = ".........";

const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function isBoard(value: string): boolean {
  return /^[xo.]{9}$/.test(value);
}

export function winningLine(board: string): number[] | null {
  const line = WINS.find(
    ([a, b, c]) =>
      board[a] !== "." && board[a] === board[b] && board[b] === board[c],
  );
  return line ?? null;
}

/** "x" or "o" for a win, "draw" for a full board, null while in progress. */
export function outcome(board: string): Outcome | null {
  const line = winningLine(board);
  if (line) {
    return board[line[0]] as Mark;
  }
  return board.includes(".") ? null : "draw";
}

export function turn(board: string): Mark {
  const xs = board.split("x").length;
  const os = board.split("o").length;
  return xs === os ? "x" : "o";
}

export function emptyCells(board: string): number[] {
  return [...board].flatMap((cell, i) => (cell === "." ? [i] : []));
}

export function place(board: string, index: number, mark: Mark): string {
  return board.slice(0, index) + mark + board.slice(index + 1);
}

/** A tiny seeded PRNG (mulberry32), so `/?seed=42` replays the same easy bot. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The easy bot: any empty cell, uniformly. */
export function randomMove(board: string, random: () => number): number {
  const cells = emptyCells(board);
  return cells[Math.floor(random() * cells.length)];
}

/** Wording for a score from the API: 1, -1, 0 or null (still playing). */
export function evaluationText(score: number | null): string {
  if (score === 1) {
    return "X wins";
  }
  if (score === -1) {
    return "O wins";
  }
  if (score === 0) {
    return "Draw";
  }
  return "Undecided";
}
