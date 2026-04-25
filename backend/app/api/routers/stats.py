from fastapi import APIRouter

from app.logic.stats import (
    GameRecord,
    average_game_length,
    calculate_win_rate,
    count_outcomes,
    find_longest_win_streak,
    player_dominance_score,
)
from app.models.stats import (
    DominanceRequest,
    DominanceResponse,
    StatsRequest,
    StatsSummaryResponse,
)

router = APIRouter(prefix="/stats", tags=["stats"])


def _to_records(req_records) -> list[GameRecord]:
    return [GameRecord(moves=r.moves, winner=r.winner) for r in req_records]


@router.post("/summary", response_model=StatsSummaryResponse)
def post_stats_summary(req: StatsRequest):
    records = _to_records(req.records)
    return StatsSummaryResponse(
        total_games=len(records),
        x_win_rate=calculate_win_rate(records, "x"),
        o_win_rate=calculate_win_rate(records, "o"),
        outcomes=count_outcomes(records),
        average_length=average_game_length(records),
    )


@router.post("/dominance", response_model=DominanceResponse)
def post_stats_dominance(req: DominanceRequest):
    records = _to_records(req.records)
    return DominanceResponse(
        player=req.player,
        dominance=player_dominance_score(records, req.player),
        longest_streak=find_longest_win_streak(records, req.player),
    )
