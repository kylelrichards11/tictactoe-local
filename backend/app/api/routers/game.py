from fastapi import APIRouter, HTTPException

from app.logic.game import State, bot_move, count_games
from app.models.game import (
    AnalyzeRequest,
    AnalyzeResponse,
    BotMoveRequest,
    BotMoveResponse,
    CountGamesResponse,
    NextStatesRequest,
    NextStatesResponse,
)

router = APIRouter(tags=["game"])


@router.post("/analyze", response_model=AnalyzeResponse)
def post_analyze(req: AnalyzeRequest):
    state = State(req.board)
    return AnalyzeResponse(score=state.score())


@router.post("/next-states", response_model=NextStatesResponse)
def post_next_states(req: NextStatesRequest):
    state = State(req.board)
    return NextStatesResponse(next_states=state.legal_moves())


@router.get("/count-games", response_model=CountGamesResponse)
def get_count_games():
    return CountGamesResponse(count=count_games())


@router.post("/bot-move", response_model=BotMoveResponse)
def post_bot_move(req: BotMoveRequest):
    try:
        result = bot_move(req.board, req.difficulty)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return BotMoveResponse(board=result)
