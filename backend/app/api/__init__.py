from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from app.api.routers import game, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def _route_name_as_operation_id(route: APIRoute) -> str:
    """Use the route's function name as the OpenAPI operationId so
    the frontend codegen produces clean names like `postAnalyze` instead
    of FastAPI's default `post_analyze_analyze_post`."""
    return route.name


def create_app() -> FastAPI:
    app = FastAPI(
        title="Tic-Tac-Toe Analysis",
        lifespan=lifespan,
        generate_unique_id_function=_route_name_as_operation_id,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(game.router)
    app.include_router(stats.router)

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    return app
