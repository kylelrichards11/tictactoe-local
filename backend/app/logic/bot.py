"""The tic-tac-toe bot: random on easy, perfect minimax on hard."""

from __future__ import annotations

import random
from functools import cache

from app.logic.game import X, State


@cache
def minimax(board: str) -> int:
    """Value of `board` under perfect play: 1 X wins, -1 O wins, 0 draw."""
    state = State(board)
    score = state.score()
    if score is not None:
        return score
    values = [minimax(move) for move in state.legal_moves()]
    return max(values) if state.turn == X else min(values)


def best_move(board: str) -> str:
    """The strongest move for whoever is to play.

    X maximises the minimax value and O minimises it. Among equally good moves
    the bot takes the one that leaves the most empty cells (so it wins at the
    first chance), then the lowest cell index, which keeps it deterministic.
    """
    state = State(board)
    sign = 1 if state.turn == X else -1
    return max(
        state.legal_moves(),
        key=lambda move: (sign * minimax(move), move.count(".")),
    )


def outcome_label(value: int) -> str:
    """Human wording for a minimax value."""
    # demo gap: only reached through the untested /evaluate route.
    if value == 1:
        return "X wins"
    if value == -1:
        return "O wins"
    return "Draw"


def bot_move(board: str, difficulty: str = "easy") -> str:
    """Choose a move for the bot. Returns the new board string."""
    state = State(board)
    moves = state.legal_moves()
    if not moves:
        raise ValueError("No legal moves available")

    if difficulty == "hard":
        return best_move(board)

    return random.choice(moves)
