from fastapi.testclient import TestClient


class TestAnalyze:
    def test_x_wins(self, client: TestClient):
        response = client.post("/analyze", json={"board": "xxx......"})
        assert response.status_code == 200
        assert response.json()["score"] == 1

    def test_game_in_progress(self, client: TestClient):
        response = client.post("/analyze", json={"board": "........."})
        assert response.status_code == 200
        assert response.json()["score"] is None


class TestCountGames:
    def test_count(self, client: TestClient):
        response = client.get("/count-games")
        assert response.status_code == 200
        assert response.json()["count"] == 255168


class TestAnalyzeGameAPI:
    def test_happy_path(self, client: TestClient):
        boards = [
            ".........",
            "x........",
            "xo.......",
            "xo.x.....",
            "xoox.....",
            "xooxx....",
            "xooxxo...",
            "xooxxox..",
        ]
        response = client.post("/analyze-game", json={"boards": boards})
        assert response.status_code == 200
        body = response.json()
        assert body["final_score"] == 1
        assert len(body["moves"]) == 7

    def test_invalid_board_returns_400(self, client: TestClient):
        response = client.post("/analyze-game", json={"boards": ["bad-board"]})
        assert response.status_code == 400
