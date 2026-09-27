from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.logic.bot import bot_move, minimax, outcome_label
from app.logic.game import EMPTY_BOARD, State, count_games
from app.models.game import (
    BOARD_PATTERN,
    AnalyzeRequest,
    AnalyzeResponse,
    BotMoveRequest,
    BotMoveResponse,
    CountGamesResponse,
    EvaluateRequest,
    EvaluateResponse,
    NextStatesRequest,
    NextStatesResponse,
)

router = APIRouter(tags=["game"])


@router.post("/analyze", response_model=AnalyzeResponse)
def post_analyze(req: AnalyzeRequest):
    state = State(req.board)
    line = state.winning_line()
    return AnalyzeResponse(
        score=state.score(),
        turn=state.turn,
        winning_line=list(line) if line else None,
    )


@router.post("/next-states", response_model=NextStatesResponse)
def post_next_states(req: NextStatesRequest):
    state = State(req.board)
    return NextStatesResponse(next_states=state.legal_moves())


@router.post("/evaluate", response_model=EvaluateResponse)
def post_evaluate(req: EvaluateRequest):
    # demo gap: no test calls this route, so verifAIed lists it as untested.
    value = minimax(req.board)
    return EvaluateResponse(value=value, outcome=outcome_label(value))


@router.get("/count-games", response_model=CountGamesResponse)
def get_count_games(
    board: Annotated[
        str, Query(min_length=9, max_length=9, pattern=BOARD_PATTERN)
    ] = EMPTY_BOARD,
):
    return CountGamesResponse(count=count_games(board))


@router.post("/bot-move", response_model=BotMoveResponse)
def post_bot_move(req: BotMoveRequest):
    try:
        result = bot_move(req.board, req.difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return BotMoveResponse(board=result)
