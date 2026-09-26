from typing import Annotated, Literal

from pydantic import BaseModel, Field

Board = Annotated[str, Field(min_length=9, max_length=9, pattern=r"^[xo.]{9}$")]


class AnalyzeRequest(BaseModel):
    board: Board


class AnalyzeResponse(BaseModel):
    score: int | None
    turn: Literal["x", "o"]
    winning_line: list[int] | None


class NextStatesRequest(BaseModel):
    board: Board


class NextStatesResponse(BaseModel):
    next_states: list[str]


class EvaluateRequest(BaseModel):
    board: Board


class EvaluateResponse(BaseModel):
    value: int
    outcome: str


class CountGamesResponse(BaseModel):
    count: int


class BotMoveRequest(BaseModel):
    board: Board
    difficulty: Literal["easy", "hard"] = "easy"


class BotMoveResponse(BaseModel):
    board: str
