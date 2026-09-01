from fastapi.testclient import TestClient


class TestStatsSummary:
    """The /stats/summary endpoint is fully tested."""

    def test_summary_with_records(self, client: TestClient):
        response = client.post(
            "/stats/summary",
            json={
                "records": [
                    {"moves": ["x........"], "winner": "x"},
                    {"moves": ["x........"], "winner": "o"},
                    {"moves": ["x........"], "winner": None},
                ]
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["total_games"] == 3
        assert body["x_win_rate"] == 1 / 3
        assert body["o_win_rate"] == 1 / 3
        assert body["outcomes"] == {"x": 1, "o": 1, "draw": 1}

    def test_summary_empty(self, client: TestClient):
        response = client.post("/stats/summary", json={"records": []})
        assert response.status_code == 200
        body = response.json()
        assert body["total_games"] == 0
        assert body["x_win_rate"] == 0.0


# Note: /stats/dominance endpoint is intentionally NOT tested.
