from fastapi.testclient import TestClient


class TestHealth:
    def test_healthy(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestAnalyze:
    def test_x_wins(self, client: TestClient):
        response = client.post("/analyze", json={"board": "xxx.oo..."})
        assert response.status_code == 200
        assert response.json() == {"score": 1, "turn": "o", "winning_line": [0, 1, 2]}

    def test_game_in_progress(self, client: TestClient):
        response = client.post("/analyze", json={"board": "........."})
        assert response.status_code == 200
        assert response.json() == {"score": None, "turn": "x", "winning_line": None}

    def test_rejects_a_malformed_board(self, client: TestClient):
        response = client.post("/analyze", json={"board": "xxx"})
        assert response.status_code == 422


class TestNextStates:
    def test_lists_every_reply(self, client: TestClient):
        response = client.post("/next-states", json={"board": "xoxoxo..."})
        assert response.status_code == 200
        assert response.json() == {
            "next_states": ["xoxoxox..", "xoxoxo.x.", "xoxoxo..x"]
        }


class TestCountGames:
    def test_count(self, client: TestClient):
        response = client.get("/count-games")
        assert response.status_code == 200
        assert response.json() == {"count": 255168}

    def test_counts_from_the_empty_board_when_asked(self, client: TestClient):
        response = client.get("/count-games", params={"board": "........."})
        assert response.status_code == 200
        assert response.json() == {"count": 255168}

    def test_counts_from_a_position(self, client: TestClient):
        response = client.get("/count-games", params={"board": "....x...."})
        assert response.status_code == 200
        assert response.json() == {"count": 25872}

    def test_a_finished_game_is_one_game(self, client: TestClient):
        response = client.get("/count-games", params={"board": "xxxoo...."})
        assert response.status_code == 200
        assert response.json() == {"count": 1}

    def test_rejects_a_malformed_board(self, client: TestClient):
        response = client.get("/count-games", params={"board": "xq......."})
        assert response.status_code == 422


class TestBotMove:
    def test_hard_blocks(self, client: TestClient):
        response = client.post(
            "/bot-move", json={"board": "xx..o....", "difficulty": "hard"}
        )
        assert response.status_code == 200
        assert response.json() == {"board": "xxo.o...."}

    def test_finished_game_is_a_400(self, client: TestClient):
        response = client.post(
            "/bot-move", json={"board": "xxxoo....", "difficulty": "hard"}
        )
        assert response.status_code == 400
        assert response.json() == {"detail": "No legal moves available"}
