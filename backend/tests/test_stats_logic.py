from app.logic.game import State
from app.logic.stats import (
    GameRecord,
    average_game_length,
    calculate_win_rate,
    count_outcomes,
    most_common_first_move,
)


def _record(moves: list[str], winner: str | None) -> GameRecord:
    return GameRecord(moves=moves, winner=winner)


class TestCalculateWinRate:
    """Fully tested: happy path, no-wins, empty list, both players."""

    def test_x_wins_all(self):
        records = [_record(["x........"], "x"), _record(["x........"], "x")]
        assert calculate_win_rate(records, "x") == 1.0

    def test_x_wins_none(self):
        records = [_record(["x........"], "o"), _record(["x........"], None)]
        assert calculate_win_rate(records, "x") == 0.0

    def test_mixed(self):
        records = [
            _record(["x........"], "x"),
            _record(["x........"], "o"),
            _record(["x........"], None),
            _record(["x........"], "x"),
        ]
        assert calculate_win_rate(records, "x") == 0.5
        assert calculate_win_rate(records, "o") == 0.25

    def test_empty(self):
        assert calculate_win_rate([], "x") == 0.0


class TestCountOutcomes:
    """Fully tested: covers all branches (x, o, draw, empty)."""

    def test_empty(self):
        assert count_outcomes([]) == {"x": 0, "o": 0, "draw": 0}

    def test_mix_of_outcomes(self):
        records = [
            _record(["x........"], "x"),
            _record(["x........"], "x"),
            _record(["x........"], "o"),
            _record(["x........"], None),
        ]
        assert count_outcomes(records) == {"x": 2, "o": 1, "draw": 1}


class TestIsTerminal:
    """Fully tested for the new State.is_terminal() method."""

    def test_in_progress(self):
        assert State(".........").is_terminal() is False

    def test_x_won(self):
        assert State("xxx......").is_terminal() is True

    def test_draw(self):
        assert State("xxoooxxox").is_terminal() is True


class TestMostCommonFirstMove:
    """Partially tested: only the obvious happy path. No coverage of empty
    records, records with no moves, or tie-breaking behavior."""

    def test_picks_dominant_first_move(self):
        records = [
            _record(["x........"], "x"),
            _record(["x........"], "o"),
            _record(["....x...."], None),
        ]
        assert most_common_first_move(records) == 0


class TestAverageGameLength:
    """Partially tested: only covers a non-empty list of equal-length games.
    No coverage of empty list (early return) or unequal lengths."""

    def test_basic_average(self):
        records = [
            _record(["x........", "xo......."], "x"),
            _record(["x........", "xo......."], "o"),
        ]
        assert average_game_length(records) == 2.0


# Note: player_dominance_score and find_longest_win_streak are intentionally
# not tested here — they represent newly-added behavior with zero coverage.
