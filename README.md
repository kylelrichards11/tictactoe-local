# Tic Tac Toe (neon)

A small tic-tac-toe game and the demo repository for [verifAIed](https://verifaied.app):
its tests, coverage and browser tests are what the verifAIed docs and videos show.
It is not a product. The code stays small on purpose.

## The look

Ski On Neon: a pure black screen where every mark is a glowing neon tube, a coloured
stroke with a hot white core and a soft halo. Each new game rolls a fresh hue pair
from cyan, magenta, lime, orange and yellow. X takes one, O the other, and the grid
glows in a dim X. Marks draw themselves in. A winning line pulses, then a fireball
runs along it. Headings use Orbitron and body text uses Geist. `prefers-reduced-motion`
turns the animation off.

## Features

- **Play** (`/`): you are X and the bot is O. **Easy** plays randomly and **Hard**
  plays perfect minimax, so it never loses. There is a status line, **New game**
  (which re-rolls the colours), a You / Draws / Bot scoreboard kept in localStorage
  with **Reset scores**, and keys 1 to 9 play a cell. `/?seed=42` makes the easy bot
  play the same moves every time.
- **Analyze** (`/analyze`): click a cell to play the side to move (click again to
  clear it), or type a position, to see its evaluation, whose turn it is, the
  perfect-play outcome and every legal next board. **Count games** asks the API how
  many legal games can be played from the current position (255,168 from the empty
  board).
- **History** (`/history`): your recent games and win rates, from localStorage.
- **About** (`/about`): the stack, and a note that this is verifAIed's demo app.

## Run it

```bash
make install     # uv venv for backend/, pnpm install at the root
make api         # FastAPI on http://localhost:8000
make frontend    # Vite on http://localhost:5173 (proxies /api to :8000)
```

## Tests and coverage

```bash
make test        # both suites, below
make lint        # ruff + eslint + tsc
make format
make codegen     # OpenAPI schema -> frontend/src/client
```

- **Backend**: pytest with branch coverage and per-test contexts. This writes
  `coverage.json` and `junit.xml` at the repo root.
- **Frontend**: vitest with Testing Library, using the Istanbul coverage provider.
  This writes `frontend/coverage/coverage-final.json` and `frontend/junit.xml`.
- **Browser**: `.verifaied/tests/**` are recorded-test specs that verifAIed runs
  against `http://localhost:5173` (`.verifaied/config.toml`). Keep both servers up.

CI (`.github/workflows/coverage.yml`) runs both suites and uploads all four files
as a single `coverage` artifact.

## Deliberate gaps

These gaps are there on purpose, so verifAIed has something to find. Each one is
marked `demo gap` in the code. Leave them alone.

| Where | What |
| --- | --- |
| `backend/app/logic/game.py` `State.__init__` | Partial: no test covers the invalid-board `ValueError` |
| `backend/app/api/routers/game.py` `post_evaluate` | Untested route |
| `backend/app/logic/bot.py` `outcome_label` | Untested helper |
| `frontend/src/pages/AboutPage.tsx` `AboutPage` | Untested component |
| `frontend/src/hooks/useKeyboardMoves.ts` | Partial: no test presses a key |
