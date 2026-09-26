import { createContext, useContext } from "react";

/** The neon hues. Every new game rolls a fresh pair: X gets one, O the other. */
export const NEON = {
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  lime: "#b6ff00",
  orange: "#ff9f1c",
  yellow: "#ffe600",
} as const;

export type Hue = keyof typeof NEON;
export type Pair = { x: Hue; o: Hue };

const HUES = Object.keys(NEON) as Hue[];

/** Neighbouring hues read as one colour at a glance, so they never pair. */
const CLASHES = [
  "orange-yellow",
  "yellow-orange",
  "lime-yellow",
  "yellow-lime",
];

function clash(a: Hue, b: Hue): boolean {
  return CLASHES.includes(`${a}-${b}`);
}

export function randomPair(
  random: () => number = Math.random,
  not?: Pair,
): Pair {
  for (;;) {
    const x = HUES[Math.floor(random() * HUES.length)];
    const o = HUES[Math.floor(random() * HUES.length)];
    const same = not !== undefined && not.x === x && not.o === o;
    if (x !== o && !clash(x, o) && !same) {
      return { x, o };
    }
  }
}

export const PaletteContext = createContext<{
  pair: Pair;
  reroll: () => void;
}>({ pair: { x: "cyan", o: "magenta" }, reroll: () => {} });

export function usePalette() {
  return useContext(PaletteContext);
}
