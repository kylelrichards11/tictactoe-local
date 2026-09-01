from pydantic import BaseModel, Field


class GameRecordModel(BaseModel):
    moves: list[str] = Field(default_factory=list)
    winner: str | None = None


class StatsRequest(BaseModel):
    records: list[GameRecordModel]


class StatsSummaryResponse(BaseModel):
    total_games: int
    x_win_rate: float
    o_win_rate: float
    outcomes: dict[str, int]
    average_length: float


class DominanceRequest(BaseModel):
    records: list[GameRecordModel]
    player: str


class DominanceResponse(BaseModel):
    player: str
    dominance: float
    longest_streak: int
