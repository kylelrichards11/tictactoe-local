import { useEffect, useState } from "react";

import type { AnalyzeResponse } from "@/client";
import {
  getCountGames,
  postAnalyze,
  postEvaluate,
  postNextStates,
} from "@/client";
import { NeonBoard } from "@/components/NeonBoard";
import { EMPTY_BOARD, evaluationText, isBoard, place, turn } from "@/lib/game";

const anyCell = () => true;

type Report = {
  analysis: AnalyzeResponse;
  perfectPlay: string;
  next: string[];
};

export function AnalyzePage() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [draft, setDraft] = useState(EMPTY_BOARD);
  const [report, setReport] = useState<Report | null>(null);
  // A count belongs to the board it was made from; editing the board hides it.
  const [counted, setCounted] = useState<{
    board: string;
    count: number;
  } | null>(null);
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    let live = true;
    const body = { body: { board } };
    Promise.all([
      postAnalyze(body),
      postEvaluate(body),
      postNextStates(body),
    ]).then(([analysis, evaluation, next]) => {
      if (live && analysis.data && evaluation.data && next.data) {
        setReport({
          analysis: analysis.data,
          perfectPlay: evaluation.data.outcome,
          next: next.data.next_states,
        });
      }
    });
    return () => {
      live = false;
    };
  }, [board]);

  const load = (next: string) => {
    setBoard(next);
    setDraft(next);
  };

  // An empty cell takes the side to move; a filled one is cleared.
  const edit = (i: number) =>
    load(
      board[i] === "."
        ? place(board, i, turn(board))
        : board.slice(0, i) + "." + board.slice(i + 1),
    );

  const countGames = async () => {
    const from = board;
    setCounting(true);
    const { data } = await getCountGames({ query: { board: from } });
    setCounted(data ? { board: from, count: data.count } : null);
    setCounting(false);
  };

  const count = counted?.board === board ? counted.count : null;

  const valid = isBoard(draft);

  return (
    <div className="analyze">
      <section className="analyze-editor">
        <h1 className="title">Analyze</h1>
        <p className="lede">
          Click a cell to play the side to move, click again to clear, or type a
          position.
        </p>
        <NeonBoard board={board} onCell={edit} canClick={anyCell} />
        <form
          className="position-form"
          onSubmit={(e) => {
            e.preventDefault();
            setBoard(draft); // the submit button is disabled while invalid
          }}
        >
          <label className="label" htmlFor="position">
            Position
          </label>
          <div className="position-row">
            <input
              id="position"
              className="input"
              value={draft}
              maxLength={9}
              spellCheck={false}
              aria-invalid={!valid}
              onChange={(e) => setDraft(e.target.value.toLowerCase())}
            />
            <button type="submit" className="btn" disabled={!valid}>
              Analyze
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => load(EMPTY_BOARD)}
            >
              Clear
            </button>
          </div>
          {!valid && <p className="error">9 cells of x, o or . please</p>}
        </form>
      </section>

      <section className="analyze-report" aria-live="polite">
        {report && (
          <>
            <dl className="facts">
              <div>
                <dt>Evaluation</dt>
                <dd data-testid="evaluation">
                  {evaluationText(report.analysis.score)}
                </dd>
              </div>
              <div>
                <dt>To move</dt>
                <dd data-testid="turn">{report.analysis.turn.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Perfect play</dt>
                <dd data-testid="perfect-play">{report.perfectPlay}</dd>
              </div>
            </dl>
            <h2 className="subtitle">
              Next boards <span className="dim">({report.next.length})</span>
            </h2>
            {report.next.length === 0 ? (
              <p className="dim">The game is over. No moves left.</p>
            ) : (
              <ul className="minis">
                {report.next.map((b) => (
                  <li key={b}>
                    <button
                      type="button"
                      className="mini-button"
                      aria-label={`Load ${b}`}
                      onClick={() => load(b)}
                    >
                      <NeonBoard board={b} size="mini" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className="count">
          <p>
            How many different games can be played from this position?{" "}
            <strong className="count-value" data-testid="game-count">
              {count === null ? "?" : count.toLocaleString("en-US")}
            </strong>
          </p>
          <button
            type="button"
            className="btn"
            onClick={countGames}
            disabled={counting}
          >
            {counting ? "Counting…" : "Count games"}
          </button>
        </div>
      </section>
    </div>
  );
}
