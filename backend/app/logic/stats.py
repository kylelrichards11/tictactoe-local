"""Summary statistics over a list of finished games, sent by the client."""

from __future__ import annotations

from dataclasses import dataclass

from app.logic.game import O, X


@dataclass
class GameResult:
    """One finished game: who won ("x", "o" or None for a draw) and at what level."""

    winner: str | None
    difficulty: str


def count_outcomes(results: list[GameResult]) -> dict[str, int]:
    """Count X wins, O wins and draws."""
    counts = {"x": 0, "o": 0, "draw": 0}
    for r in results:
        if r.winner == X:
            counts["x"] += 1
        elif r.winner == O:
            counts["o"] += 1
        else:
            counts["draw"] += 1
    return counts


def win_rate(results: list[GameResult], difficulty: str) -> float | None:
    """Fraction of games at `difficulty` that X won, or None if none were played."""
    played = [r for r in results if r.difficulty == difficulty]
    if not played:
        return None
    return sum(1 for r in played if r.winner == X) / len(played)


def hard_bot_unbeaten(results: list[GameResult]) -> bool:
    """True when X has never beaten the hard bot."""
    return not any(r.winner == X and r.difficulty == "hard" for r in results)
