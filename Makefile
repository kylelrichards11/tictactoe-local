.PHONY: api frontend test codegen format lint install

# Start the API server
api:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# Install frontend dependencies and start dev server
frontend:
	cd frontend && pnpm install && pnpm dev

# Run backend tests with coverage
test:
	cd backend && .venv/bin/pytest --cov --cov-report=term-missing --cov-report=json

# Regenerate OpenAPI schema + TypeScript client
codegen:
	cd backend && .venv/bin/python scripts/generate_openapi.py
	cd frontend && pnpm codegen

# Format code
format:
	cd backend && .venv/bin/ruff format . && .venv/bin/ruff check --fix .
	cd frontend && pnpm lint:fix

# Lint code
lint:
	cd backend && .venv/bin/ruff check .
	cd frontend && pnpm lint
	cd frontend && pnpm type-check

# Install all dependencies
install:
	cd backend && uv venv && uv pip install -e ".[dev]"
	cd frontend && pnpm install
