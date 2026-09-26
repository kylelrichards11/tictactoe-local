import { useEffect } from "react";

/** Keys 1-9 play the matching cell, reading left to right, top to bottom. */
export function useKeyboardMoves(
  onCell: (index: number) => void,
  enabled: boolean,
) {
  // demo gap: no unit test presses keys, so verifAIed flags this hook.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT") {
        return;
      }
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= 9) {
        onCell(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCell, enabled]);
}
