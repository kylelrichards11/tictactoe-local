"""Deliberately failing tests: the fixture for verifAIed's failing-test views."""

from fastapi.testclient import TestClient

from app.logic.bot import bot_move
from app.logic.game import State


class TestTurn:
    def test_empty_board_turn_is_o(self):
        assert State(".........").turn == "o"

    def test_x_to_move_after_x_plays_first(self):
        assert State("x........").turn == "x"


class TestScoreWrong:
    def test_o_wins_diagonal_scored_as_one(self):
        assert State("o...o...o").score() == 1


def test_hard_bot_lets_x_win():
    assert bot_move("xx..o....", "hard") == "xx.oo...."


def test_stats_route_counts_a_draw_as_a_win(client: TestClient):
    response = client.post(
        "/stats", json={"games": [{"winner": None, "difficulty": "hard"}]}
    )
    assert response.json()["x_wins"] == 1
