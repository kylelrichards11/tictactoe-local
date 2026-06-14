from __future__ import annotations

from enum import Enum
from functools import lru_cache
from typing import TYPE_CHECKING

from app.logic.game import State, X

if TYPE_CHECKING:
    from app.models.game import GameAnalysis


class MoveQuality(str, Enum):
    BEST = "best"
    GOOD = "good"
    INACCURACY = "inaccuracy"
    MISTAKE = "mistake"
    BLUNDER = "blunder"


@lru_cache(maxsize=None)
def evaluate_position(state: State) -> int:
    """Return the optimal-play evaluation of a position.

    +1 means X wins with perfect play, -1 means O wins, 0 means draw.
    """
    terminal = state.score()
    if terminal is not None:
        return terminal
    child_evals = [evaluate_position(State(b)) for b in state.legal_moves()]
    if state.turn == X:
        return max(child_evals)
    return min(child_evals)


def best_moves(state: State) -> list[State]:
    """Return all next states that preserve the optimal evaluation."""
    candidates = [State(b) for b in state.legal_moves()]
    if not candidates:
        return []
    evals = [evaluate_position(c) for c in candidates]
    if state.turn == X:
        target = max(evals)
    else:
        target = min(evals)
    return [c for c, e in zip(candidates, evals) if e == target]


def _player_value(eval_score: int, player: str) -> int:
    return eval_score if player == X else -eval_score


def classify_move(before: State, after: State) -> MoveQuality:
    """Classify how a move changes the position's evaluation."""
    mover = before.turn
    eval_before = evaluate_position(before)
    eval_after = evaluate_position(after)
    drop = _player_value(eval_before, mover) - _player_value(eval_after, mover)

    if drop <= 0:
        if after in best_moves(before):
            return MoveQuality.BEST
        return MoveQuality.GOOD
    if drop == 1:
        was_winning = _player_value(eval_before, mover) == 1
        if was_winning:
            return MoveQuality.MISTAKE
        return MoveQuality.INACCURACY
    return MoveQuality.BLUNDER


def analyze_game(moves: list[State]) -> "GameAnalysis":
    """Walk a game's positions, classify each move, summarize outcomes."""
    from app.models.game import GameAnalysis, MoveAnalysis

    if len(moves) < 2:
        return GameAnalysis(
            moves=[],
            turning_point=None,
            x_blunders=0,
            o_blunders=0,
            final_score=moves[0].score() if moves else None,
        )

    move_analyses: list[MoveAnalysis] = []
    x_blunders = 0
    o_blunders = 0
    turning_point: int | None = None

    for i in range(len(moves) - 1):
        before = moves[i]
        after = moves[i + 1]
        eval_before = evaluate_position(before)
        eval_after = evaluate_position(after)
        quality = classify_move(before, after)

        if quality == MoveQuality.BLUNDER:
            if before.turn == X:
                x_blunders += 1
            else:
                o_blunders += 1

        if turning_point is None and eval_before != eval_after:
            turning_point = i

        move_analyses.append(
            MoveAnalysis(
                before=before.board,
                after=after.board,
                eval_before=eval_before,
                eval_after=eval_after,
                quality=quality.value,
            )
        )

    return GameAnalysis(
        moves=move_analyses,
        turning_point=turning_point,
        x_blunders=x_blunders,
        o_blunders=o_blunders,
        final_score=moves[-1].score(),
    )


def hard_bot_move(board: str) -> str:
    """Pick an optimal move using minimax."""
    state = State(board)
    optimal = best_moves(state)
    if not optimal:
        raise ValueError("No legal moves available")
    return optimal[0].board
