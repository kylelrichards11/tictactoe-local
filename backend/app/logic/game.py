from __future__ import annotations

import random
from functools import cache

X = "x"
O = "o"  # noqa: E741
EMPTY = "."

WINS = [
    (0, 1, 2),
    (3, 4, 5),
    (6, 7, 8),  # rows
    (0, 3, 6),
    (1, 4, 7),
    (2, 5, 8),  # cols
    (0, 4, 8),
    (2, 4, 6),  # diags
]


class State:
    """State of a tic-tac-toe board, represented as a 9-character string."""

    def __init__(self, board: str = "........."):
        if len(board) != 9 or not all(c in "xo." for c in board):
            raise ValueError(f"Invalid board: {board}")
        self.board = board

    @property
    def turn(self) -> str:
        """Return whose turn it is. X always goes first."""
        x_count = self.board.count(X)
        o_count = self.board.count(O)
        return X if x_count == o_count else O

    def _winner(self) -> str | None:
        for a, b, c in WINS:
            if self.board[a] == self.board[b] == self.board[c] != EMPTY:
                return self.board[a]
        return None

    def score(self) -> int | None:
        """Return the result of the state.

        If the game is not over, return None. Otherwise, return 1 for a victory
        for the 'x' player, -1 for a victory for the 'o' player, and 0 for a
        draw.
        """
        winner = self._winner()
        if winner == X:
            return 1
        if winner == O:
            return -1
        if EMPTY not in self.board:
            return 0
        return None

    def legal_moves(self) -> list[str]:
        """Return board strings for all legal next moves."""
        if self.score() is not None:
            return []
        result = []
        t = self.turn
        for i, c in enumerate(self.board):
            if c == EMPTY:
                new_board = self.board[:i] + t + self.board[i + 1 :]
                result.append(new_board)
        return result

    def is_terminal(self) -> bool:
        """True if the game is over (someone won or the board is full)."""
        return self.score() is not None

    def __hash__(self):
        return hash(self.board)

    def __eq__(self, other: object) -> bool:
        if isinstance(other, State):
            return self.board == other.board
        return False


@cache
def _count_sub_games(board: str) -> int:
    """Count the number of legal games starting from the given board state."""
    state = State(board)
    next_moves = state.legal_moves()
    if len(next_moves) == 0:
        return 1
    return sum(_count_sub_games(move) for move in next_moves)


def count_games() -> int:
    """Count the number of legal games of tic-tac-toe."""
    return _count_sub_games(".........")


def bot_move(board: str, difficulty: str = "easy") -> str:
    """Choose a move for the bot. Returns the new board string."""
    state = State(board)
    moves = state.legal_moves()
    if not moves:
        raise ValueError("No legal moves available")

    if difficulty == "medium":
        # Take a winning move if one exists, else block, else random.
        me = state.turn
        opponent = O if me == X else X
        for move in moves:
            if State(move)._winner() == me:
                return move
        for move in moves:
            blocking_state = State(move[:move.index(me)] + opponent + move[move.index(me) + 1:]) if me in move else None
            if blocking_state and blocking_state._winner() == opponent:
                return move
        return random.choice(moves)

    if difficulty == "hard":
        # TODO: implement minimax or similar
        return random.choice(moves)

    # Easy mode: random
    return random.choice(moves)
