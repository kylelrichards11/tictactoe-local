from typing import Literal

from pydantic import BaseModel, Field

Quality = Literal["best", "good", "inaccuracy", "mistake", "blunder"]


class AnalyzeRequest(BaseModel):
    board: str = Field(..., min_length=9, max_length=9, pattern=r"^[xo.]{9}$")


class AnalyzeResponse(BaseModel):
    score: int | None


class NextStatesRequest(BaseModel):
    board: str = Field(..., min_length=9, max_length=9, pattern=r"^[xo.]{9}$")


class NextStatesResponse(BaseModel):
    next_states: list[str]


class CountGamesResponse(BaseModel):
    count: int


class BotMoveRequest(BaseModel):
    board: str = Field(..., min_length=9, max_length=9, pattern=r"^[xo.]{9}$")
    difficulty: Literal["easy", "hard"] = "easy"


class BotMoveResponse(BaseModel):
    board: str


class MoveAnalysis(BaseModel):
    before: str = Field(..., min_length=9, max_length=9, pattern=r"^[xo.]{9}$")
    after: str = Field(..., min_length=9, max_length=9, pattern=r"^[xo.]{9}$")
    eval_before: int
    eval_after: int
    quality: Quality


class GameAnalysis(BaseModel):
    moves: list[MoveAnalysis]
    turning_point: int | None
    x_blunders: int
    o_blunders: int
    final_score: int | None


class AnalyzeGameRequest(BaseModel):
    boards: list[str] = Field(..., min_length=1)
