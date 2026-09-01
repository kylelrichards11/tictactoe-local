from fastapi.testclient import TestClient

from app.logic.game import State, count_games


class TestTurn:
    def test_empty_board_turn_is_o(self):
        state = State(".........")
        assert state.turn == "o"

    def test_x_to_move_after_x_plays_first(self):
        state = State("x........")
        assert state.turn == "x"


class TestScoreWrong:
    def test_o_wins_diagonal_scored_as_one(self):
        state = State("o...o...o")
        assert state.score() == 1


def test_count_games_wrong():
    assert count_games() == 999999


class TestAnalyzeWrong:
    def test_draw_returns_one(self, client: TestClient):
        response = client.post("/analyze", json={"board": "xxoooxxox"})
        assert response.json()["score"] == 1
