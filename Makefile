.PHONY: api frontend test test-backend test-frontend codegen format lint install

# Start the API server (http://localhost:8000)
api:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# Start the frontend dev server (http://localhost:5173, proxies /api to :8000)
frontend:
	cd frontend && pnpm dev

# Run both suites with coverage + JUnit
test: test-backend test-frontend

# Backend: coverage.json (with per-test contexts) + junit.xml at the repo root
test-backend:
	cd backend && .venv/bin/pytest --cov --cov-branch --cov-context=test \
		--cov-report=term-missing --cov-report=json:../coverage.json --junit-xml=../junit.xml

# Frontend: frontend/coverage/coverage-final.json (Istanbul) + frontend/junit.xml
test-frontend:
	cd frontend && pnpm test:coverage

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
	cd backend && .venv/bin/ruff check . && .venv/bin/ruff format --check .
	cd frontend && pnpm lint
	cd frontend && pnpm type-check

# Install all dependencies
install:
	cd backend && uv venv && uv pip install -e ".[dev]"
	pnpm install
