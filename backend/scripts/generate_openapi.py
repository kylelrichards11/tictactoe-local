"""Dump the FastAPI app's OpenAPI schema to the repo-root openapi-schema.json.

Invoked by `make codegen`. The emitted file is the input to the frontend's
@hey-api/openapi-ts step, which generates TypeScript types + a fetch SDK
in frontend/src/client/.
"""

import json
from pathlib import Path

from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = REPO_ROOT / "openapi-schema.json"


def main() -> None:
    spec = app.openapi()
    OUTPUT.write_text(json.dumps(spec, indent=2) + "\n")
    print(f"wrote {OUTPUT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
