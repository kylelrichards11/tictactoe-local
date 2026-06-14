from app.logic.analysis import (
    MoveQuality,
    analyze_game,
    best_moves,
    classify_move,
    evaluate_position,
)
from app.logic.game import State, bot_move


class TestEvaluatePosition:
    def test_empty_board_is_draw(self):
        assert evaluate_position(State(".........")) == 0

    def test_terminal_x_win(self):
        assert evaluate_position(State("xxx......")) == 1

    def test_terminal_o_win(self):
        assert evaluate_position(State(".o..o..o.")) == -1

    def test_x_has_forced_win(self):
        # X has two in a row at 0,1 and it's X's turn — playing 2 wins.
        assert evaluate_position(State("xx.o..o..")) == 1

    def test_x_corner_opening_wins(self):
        # X opens in the corner, which gives X a strong attacking position.
        # With perfect play from here, X should be able to force a win.
        assert evaluate_position(State("x........")) == 1


class TestBestMoves:
    def test_empty_board_all_moves_optimal(self):
        bests = best_moves(State("........."))
        assert len(bests) == 9

    def test_forced_block(self):
        # X has two in a row and threatens to win — O must block at index 2.
        state = State("xx...o...")
        bests = best_moves(state)
        assert len(bests) == 1
        assert bests[0].board == "xxo..o..."

    def test_x_picks_immediately_winning_move(self):
        state = State("xx.o..o..")
        bests = best_moves(state)
        winning_boards = {b.board for b in bests}
        assert "xxxo..o.." in winning_boards


class TestClassifyMove:
    def test_best_winning_move_is_classified_best(self):
        before = State("xx.o..o..")
        after = State("xxxo..o..")
        assert classify_move(before, after) == MoveQuality.BEST

    def test_giving_up_winning_game_is_blunder(self):
        # X was winning (eval 1). X plays a move that throws the game to O
        # (eval -1). That is a clear two-step swing — a blunder.
        before = State("x.o......")
        after = State("xxo......")
        assert classify_move(before, after) == MoveQuality.BLUNDER

    def test_lost_win_is_blunder(self):
        # X had a winning position; X plays a careless move that gives up the
        # win. Going from a won game to a drawn one is a blunder.
        before = State("xo.......")
        after = State("xox......")
        assert classify_move(before, after) == MoveQuality.BLUNDER


class TestAnalyzeGame:
    GAME_X_WINS = [
        ".........",
        "x........",
        "xo.......",
        "xo.x.....",
        "xoox.....",
        "xooxx....",
        "xooxxo...",
        "xooxxox..",
    ]

    GAME_WITH_O_GIVING_UP_ADVANTAGE = [
        ".........",
        ".....x...",
        "o....x...",
        "ox...x...",
        "ox..ox...",
        "oxx.ox...",
        "oxxoox...",
        "oxxoox..x",
    ]

    def test_happy_path_x_wins(self):
        result = analyze_game([State(b) for b in self.GAME_X_WINS])
        assert result.final_score == 1
        assert len(result.moves) == 7

    def test_turning_point_detected(self):
        result = analyze_game([State(b) for b in self.GAME_X_WINS])
        # The eval shifted at the second move, when O failed to play optimally.
        assert result.turning_point == 1

    def test_blunder_counts_per_player(self):
        result = analyze_game([State(b) for b in self.GAME_WITH_O_GIVING_UP_ADVANTAGE])
        assert result.x_blunders == 1

    def test_o_blunders_counted_correctly(self):
        # In this game O has two moves where the eval moves against O — at
        # indices 3 and 5. Both squander a winning position, so both count.
        result = analyze_game([State(b) for b in self.GAME_WITH_O_GIVING_UP_ADVANTAGE])
        assert result.o_blunders == 2


class TestHardBotMove:
    def test_hard_blocks_winning_threat(self):
        # X threatens to win at index 2; the hard bot must block.
        result = bot_move("xx...o...", "hard")
        assert result == "xxo..o..."
