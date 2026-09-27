from fastapi import APIRouter

from app.logic.stats import GameResult, count_outcomes, hard_bot_unbeaten, win_rate
from app.models.stats import StatsRequest, StatsResponse

router = APIRouter(tags=["stats"])


@router.post("/stats", response_model=StatsResponse)
def post_stats(req: StatsRequest):
    results = [GameResult(winner=g.winner, difficulty=g.difficulty) for g in req.games]
    counts = count_outcomes(results)
    return StatsResponse(
        x_wins=counts["x"],
        o_wins=counts["o"],
        draws=counts["draw"],
        hard_win_rate=win_rate(results, "hard"),
        easy_win_rate=win_rate(results, "easy"),
        hard_bot_unbeaten=hard_bot_unbeaten(results),
    )
