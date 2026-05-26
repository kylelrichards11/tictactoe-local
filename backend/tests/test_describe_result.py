from app.logic.game import describe_result


class TestDescribeResult:
    def test_x_wins(self):
        # Covers the score == 1 branch only.
        assert describe_result("xxx......") == "X wins"

    def test_in_progress(self):
        # Covers the fall-through "to move" branch.
        assert describe_result("x.o.x....") == "O to move"

    def test_draw(self):
        # FAILING: a full board with no winner is a draw, not "O wins".
        assert describe_result("xxoooxxox") == "O wins"
