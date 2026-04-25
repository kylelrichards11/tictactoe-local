from typing import Literal

from pydantic import BaseModel, Field


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
    difficulty: Literal["easy", "medium", "hard"] = "easy"


class BotMoveResponse(BaseModel):
    board: str
