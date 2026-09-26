from __future__ import annotations

from functools import cache

X = "x"
O = "o"  # noqa: E741
EMPTY = "."
EMPTY_BOARD = "........."

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

    def __init__(self, board: str = EMPTY_BOARD):
        # demo gap: the invalid-board branch is deliberately never exercised,
        # so this function shows up as partially covered in verifAIed.
        if len(board) != 9 or not all(c in "xo." for c in board):
            raise ValueError(f"Invalid board: {board}")
        self.board = board

    @property
    def turn(self) -> str:
        """Return whose turn it is. X always goes first."""
        x_count = self.board.count(X)
        o_count = self.board.count(O)
        return X if x_count == o_count else O

    def winning_line(self) -> tuple[int, int, int] | None:
        """Return the three cells of the completed line, if there is one."""
        for a, b, c in WINS:
            if self.board[a] == self.board[b] == self.board[c] != EMPTY:
                return (a, b, c)
        return None

    def score(self) -> int | None:
        """Return the result of the state.

        If the game is not over, return None. Otherwise, return 1 for a victory
        for the 'x' player, -1 for a victory for the 'o' player, and 0 for a
        draw.
        """
        line = self.winning_line()
        if line is not None:
            return 1 if self.board[line[0]] == X else -1
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

    def __hash__(self):
        return hash(self.board)

    def __eq__(self, other: object) -> bool:
        if isinstance(other, State):
            return self.board == other.board
        return False


def empty_count(board: str) -> int:
    """How many cells are still open on `board`."""
    return State(board).board.count(EMPTY)


@cache
def _count_sub_games(board: str) -> int:
    """Count the number of legal games starting from the given board state."""
    state = State(board)
    next_moves = state.legal_moves()
    if len(next_moves) == 0:
        return 1
    return sum(_count_sub_games(move) for move in next_moves)


def count_games(board: str = EMPTY_BOARD) -> int:
    """Count the legal games that can be played out from `board`.

    From the empty board this is every legal game of tic-tac-toe: 255,168.
    A finished position counts as the one game that ends there.
    """
    return _count_sub_games(board)
