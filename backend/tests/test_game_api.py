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
