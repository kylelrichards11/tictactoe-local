from fastapi.testclient import TestClient

from app.logic.stats import GameResult, count_outcomes, hard_bot_unbeaten, win_rate

GAMES = [
    GameResult(winner="x", difficulty="easy"),
    GameResult(winner=None, difficulty="hard"),
    GameResult(winner="o", difficulty="hard"),
    GameResult(winner=None, difficulty="hard"),
]


class TestCountOutcomes:
    def test_counts_each_result(self):
        assert count_outcomes(GAMES) == {"x": 1, "o": 1, "draw": 2}


class TestWinRate:
    def test_easy(self):
        assert win_rate(GAMES, "easy") == 1.0

    def test_hard(self):
        assert win_rate(GAMES, "hard") == 0.0

    def test_no_games(self):
        assert win_rate([], "hard") is None


class TestHardBotUnbeaten:
    def test_unbeaten(self):
        assert hard_bot_unbeaten(GAMES) is True

    def test_beaten(self):
        assert hard_bot_unbeaten([GameResult(winner="x", difficulty="hard")]) is False


class TestStatsApi:
    def test_summarises_games(self, client: TestClient):
        response = client.post(
            "/stats",
            json={
                "games": [
                    {"winner": "x", "difficulty": "easy"},
                    {"winner": None, "difficulty": "hard"},
                ]
            },
        )
        assert response.status_code == 200
        assert response.json() == {
            "x_wins": 1,
            "o_wins": 0,
            "draws": 1,
            "hard_win_rate": 0.0,
            "easy_win_rate": 1.0,
            "hard_bot_unbeaten": True,
        }
