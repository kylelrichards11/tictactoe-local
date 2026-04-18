import pytest

from app.logic.game import State, count_games


class TestScore:
    def test_x_wins_row(self):
        state = State("xxx......")
        assert state.score() == 1

    def test_o_wins_col(self):
        state = State(".o..o..o.")
        assert state.score() == -1

    def test_draw(self):
        state = State("xxoooxxox")
        assert state.score() == 0

    def test_game_in_progress(self):
        state = State(".........")
        assert state.score() is None

    def test_game_in_progress_partial(self):
        state = State("x.o.x....")
        assert state.score() is None


class TestLegalMoves:
    def test_empty_board(self):
        state = State(".........")
        moves = state.legal_moves()
        assert len(moves) == 9

    def test_partial_board(self):
        state = State("o.xo.xx.o")
        moves = state.legal_moves()
        assert len(moves) == 3
        assert moves[0] == "oxxo.xx.o"
        assert moves[1] == "o.xoxxx.o"
        assert moves[2] == "o.xo.xxxo"


@pytest.mark.slow
def test_count_games():
    assert count_games() == 255168
