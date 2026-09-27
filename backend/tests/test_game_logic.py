import pytest

from app.logic.game import State, count_games


class TestTurn:
    def test_x_moves_first(self):
        assert State().turn == "x"

    def test_o_moves_after_x(self):
        assert State("x........").turn == "o"

    def test_x_moves_again_when_counts_match(self):
        assert State("xo.......").turn == "x"


class TestWinningLine:
    def test_top_row(self):
        assert State("xxx.oo...").winning_line() == (0, 1, 2)

    def test_anti_diagonal(self):
        assert State("xxo.o.o.x").winning_line() == (2, 4, 6)

    def test_no_line(self):
        assert State("xo.......").winning_line() is None


class TestScore:
    def test_x_wins_row(self):
        assert State("xxx......").score() == 1

    def test_o_wins_col(self):
        assert State(".o..o..o.").score() == -1

    def test_draw(self):
        assert State("xxoooxxox").score() == 0

    def test_game_in_progress(self):
        assert State(".........").score() is None

    def test_game_in_progress_partial(self):
        assert State("x.o.x....").score() is None


class TestLegalMoves:
    def test_empty_board(self):
        moves = State(".........").legal_moves()
        assert len(moves) == 9
        assert moves[0] == "x........"
        assert moves[8] == "........x"

    def test_partial_board(self):
        moves = State("o.xo.xx.o").legal_moves()
        assert moves == ["oxxo.xx.o", "o.xoxxx.o", "o.xo.xxxo"]

    def test_finished_game_has_no_moves(self):
        assert State("xxxoo....").legal_moves() == []


class TestEquality:
    def test_same_board_is_equal(self):
        assert State("x........") == State("x........")
        assert hash(State("x........")) == hash("x........")

    def test_different_board_is_not_equal(self):
        assert State("x........") != State(".x.......")

    def test_not_equal_to_a_string(self):
        assert State("x........") != "x........"


@pytest.mark.slow
def test_count_games():
    assert count_games() == 255168


def test_count_games_from_a_position():
    assert count_games("o...x...x") == 536
    assert count_games("....x....") == 25872
