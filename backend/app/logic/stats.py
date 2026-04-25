from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from app.logic.game import O, X


@dataclass
class GameRecord:
    """A record of a completed (or in-progress) game.

    `moves` is the ordered list of board states each player produced, ending
    with the final board. `winner` is "x", "o", or None for a draw.
    """

    moves: list[str]
    winner: str | None


def calculate_win_rate(records: list[GameRecord], player: str) -> float:
    """Fraction of games in `records` won by `player`. Returns 0.0 for an empty list."""
    if not records:
        return 0.0
    wins = sum(1 for r in records if r.winner == player)
    return wins / len(records)


def count_outcomes(records: list[GameRecord]) -> dict[str, int]:
    """Count of x-wins, o-wins, and draws across `records`."""
    counts = {"x": 0, "o": 0, "draw": 0}
    for r in records:
        if r.winner == X:
            counts["x"] += 1
        elif r.winner == O:
            counts["o"] += 1
        else:
            counts["draw"] += 1
    return counts


def most_common_first_move(records: list[GameRecord]) -> int | None:
    """Return the index (0-8) of the cell most often played as X's opening move.

    Returns None if there are no records with at least one move.
    """
    first_moves = []
    for r in records:
        if not r.moves:
            continue
        board = r.moves[0]
        for i, c in enumerate(board):
            if c == X:
                first_moves.append(i)
                break
    if not first_moves:
        return None
    return Counter(first_moves).most_common(1)[0][0]


def average_game_length(records: list[GameRecord]) -> float:
    """Average number of moves played across `records`. Returns 0.0 if empty."""
    if not records:
        return 0.0
    total = sum(len(r.moves) for r in records)
    return total / len(records)


def player_dominance_score(records: list[GameRecord], player: str) -> float:
    """Heuristic 'dominance' score for `player` across `records`.

    Combines win rate with how quickly wins occur: a quick win counts more
    than a drawn-out one. Score is in [0.0, 1.0].
    """
    if not records:
        return 0.0
    score = 0.0
    for r in records:
        if r.winner != player:
            continue
        # Shorter games -> higher contribution. Min game is 5 moves, max 9.
        length = max(len(r.moves), 1)
        score += 1.0 + (9 - length) / 9.0
    return score / (2 * len(records))


def find_longest_win_streak(records: list[GameRecord], player: str) -> int:
    """Length of the longest consecutive run of wins by `player` in `records`."""
    longest = 0
    current = 0
    for r in records:
        if r.winner == player:
            current += 1
            if current > longest:
                longest = current
        else:
            current = 0
    return longest
