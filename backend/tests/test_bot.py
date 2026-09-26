import pytest

from app.logic.bot import best_move, bot_move, minimax
from app.logic.game import State


class TestMinimax:
    def test_empty_board_is_a_draw(self):
        assert minimax(".........") == 0

    def test_finished_board_returns_its_score(self):
        assert minimax("xxxoo....") == 1

    def test_x_to_move_can_force_a_win(self):
        # X has two open threats after taking the centre-left fork.
        assert minimax("x...o...x") == 0
        assert minimax("xx..o....") == 0
        assert minimax("x.x.o.o..") == 1

    def test_o_to_move_with_a_winning_reply(self):
        assert minimax("oo.xx.x..") == -1


class TestBestMove:
    def test_takes_the_immediate_win(self):
        # O to move: completing the top row beats blocking X.
        assert best_move("oo.xx.x..") == "oooxx.x.."

    def test_blocks_the_opponent(self):
        # O to move must block X's top row.
        assert best_move("xx..o....") == "xxo.o...."

    def test_opens_in_the_corner(self):
        # Every opening is a draw; ties go to the lowest index.
        assert best_move(".........") == "x........"


class TestBotMove:
    def test_hard_plays_the_best_move(self):
        assert bot_move("xx..o....", "hard") == "xxo.o...."

    def test_easy_plays_a_legal_move(self):
        board = "xo.x....."
        assert bot_move(board, "easy") in State(board).legal_moves()

    def test_no_moves_left_raises(self):
        with pytest.raises(ValueError, match="No legal moves available"):
            bot_move("xxxoo....", "hard")

    def test_hard_bot_never_loses(self):
        """X tries every line against the hard bot; O never loses."""

        def play(board: str) -> None:
            state = State(board)
            if state.score() is not None:
                assert state.score() != 1, board
                return
            for move in state.legal_moves():
                reply = move if State(move).score() is not None else None
                if reply is None:
                    reply = bot_move(move, "hard")
                play(reply)

        play(".........")


class TestEasyBotTakesFreeWins:
    def test_completes_its_row(self):
        assert bot_move("oo.xx.x..", "easy") == "oooxx.x.."
