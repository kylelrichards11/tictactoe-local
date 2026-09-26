from typing import Literal

from pydantic import BaseModel


class GameResultIn(BaseModel):
    winner: Literal["x", "o"] | None
    difficulty: Literal["easy", "hard"]


class StatsRequest(BaseModel):
    games: list[GameResultIn]


class StatsResponse(BaseModel):
    x_wins: int
    o_wins: int
    draws: int
    hard_win_rate: float | None
    easy_win_rate: float | None
    hard_bot_unbeaten: bool
