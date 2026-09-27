import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCountGames,
  postAnalyze,
  postEvaluate,
  postNextStates,
} from "@/client";

import { AnalyzePage } from "./AnalyzePage";

vi.mock("@/client", () => ({
  postAnalyze: vi.fn(),
  postEvaluate: vi.fn(),
  postNextStates: vi.fn(),
  getCountGames: vi.fn(),
}));

/** A fake API that knows the empty board, one X in the centre, and a won game. */
const API: Record<
  string,
  { score: number | null; turn: "x" | "o"; next: string[] }
> = {
  ".........": { score: null, turn: "x", next: ["x........", "....x...."] },
  "....x....": { score: null, turn: "o", next: ["o...x....", ".o..x...."] },
  "o...x....": { score: null, turn: "x", next: ["ox..x....", "o...x...x"] },
  "o...x...x": { score: null, turn: "o", next: ["oo..x...x"] },
  "o.......x": { score: null, turn: "x", next: ["ox......x"] },
  "........x": { score: null, turn: "o", next: ["o.......x"] },
  "xxxoo....": { score: 1, turn: "o", next: [] },
};

beforeEach(() => {
  vi.mocked(postAnalyze).mockImplementation(async ({ body }) => {
    const { score, turn } = API[body.board];
    return { data: { score, turn, winning_line: null } } as never;
  });
  vi.mocked(postEvaluate).mockImplementation(async () => {
    return { data: { value: 0, outcome: "Draw" } } as never;
  });
  vi.mocked(postNextStates).mockImplementation(async ({ body }) => {
    return { data: { next_states: API[body.board].next } } as never;
  });
});

describe("AnalyzePage", () => {
  it("reports on the empty board", async () => {
    render(<AnalyzePage />);
    expect(await screen.findByTestId("evaluation")).toHaveTextContent(
      "Undecided",
    );
    expect(screen.getByTestId("turn")).toHaveTextContent("X");
    expect(screen.getByTestId("perfect-play")).toHaveTextContent("Draw");
    expect(
      screen.getByRole("heading", { name: "Next boards (2)" }),
    ).toBeVisible();
  });

  it("places the side to move on each click, alternating X and O", async () => {
    render(<AnalyzePage />);
    const position = screen.getByLabelText("Position");

    await userEvent.click(screen.getByRole("button", { name: "Cell 5" }));
    expect(position).toHaveValue("....x....");
    expect(await screen.findByTestId("turn")).toHaveTextContent("O");

    await userEvent.click(screen.getByRole("button", { name: "Cell 1" }));
    expect(position).toHaveValue("o...x....");
    await waitFor(() =>
      expect(screen.getByTestId("turn")).toHaveTextContent("X"),
    );

    await userEvent.click(screen.getByRole("button", { name: "Cell 9" }));
    expect(position).toHaveValue("o...x...x");
    await waitFor(() =>
      expect(screen.getByTestId("turn")).toHaveTextContent("O"),
    );
    expect(postAnalyze).toHaveBeenLastCalledWith({
      body: { board: "o...x...x" },
    });
  });

  it("clears a filled cell when it is clicked again", async () => {
    render(<AnalyzePage />);
    const position = screen.getByLabelText("Position");
    for (const n of [5, 1, 9]) {
      await userEvent.click(screen.getByRole("button", { name: `Cell ${n}` }));
    }
    expect(screen.getByRole("button", { name: "Cell 5" })).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Cell 5" }));
    expect(position).toHaveValue("o.......x");
    await waitFor(() =>
      expect(screen.getByTestId("turn")).toHaveTextContent("X"),
    );

    await userEvent.click(screen.getByRole("button", { name: "Cell 1" }));
    expect(position).toHaveValue("........x");
    await waitFor(() =>
      expect(screen.getByTestId("turn")).toHaveTextContent("O"),
    );
    await userEvent.click(screen.getByRole("button", { name: "Cell 9" }));
    expect(position).toHaveValue(".........");
    await waitFor(() =>
      expect(screen.getByTestId("turn")).toHaveTextContent("X"),
    );
  });

  it("loads a next board when it is clicked", async () => {
    render(<AnalyzePage />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Load ....x...." }),
    );
    expect(screen.getByLabelText("Position")).toHaveValue("....x....");
    expect(
      await screen.findByRole("button", { name: "Load o...x...." }),
    ).toBeVisible();
  });

  it("analyses a typed position and says when the game is over", async () => {
    render(<AnalyzePage />);
    const input = screen.getByLabelText("Position");
    await userEvent.clear(input);
    await userEvent.type(input, "XXXOO....");
    await userEvent.click(screen.getByRole("button", { name: "Analyze" }));

    expect(
      await screen.findByText("The game is over. No moves left."),
    ).toBeVisible();
    expect(screen.getByTestId("evaluation")).toHaveTextContent("X wins");
  });

  it("refuses a malformed position", async () => {
    render(<AnalyzePage />);
    const input = screen.getByLabelText("Position");
    await userEvent.clear(input);
    await userEvent.type(input, "xq");

    expect(screen.getByText("9 cells of x, o or . please")).toBeVisible();
    expect(screen.getByRole("button", { name: "Analyze" })).toBeDisabled();
    await userEvent.type(input, "{Enter}");
    expect(postAnalyze).not.toHaveBeenCalledWith({ body: { board: "xq" } });
  });

  it("clears back to the empty board", async () => {
    render(<AnalyzePage />);
    await userEvent.click(screen.getByRole("button", { name: "Cell 5" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Position")).toHaveValue(".........");
  });

  it("counts every legal game", async () => {
    vi.mocked(getCountGames).mockResolvedValue({
      data: { count: 255168 },
    } as never);
    render(<AnalyzePage />);
    expect(screen.getByTestId("game-count")).toHaveTextContent("?");

    await userEvent.click(screen.getByRole("button", { name: "Count games" }));
    expect(await screen.findByText("255,168")).toBeVisible();
  });

  it("shows nothing new when the count fails", async () => {
    vi.mocked(getCountGames).mockResolvedValue({ data: undefined } as never);
    render(<AnalyzePage />);
    await userEvent.click(screen.getByRole("button", { name: "Count games" }));
    expect(
      await screen.findByRole("button", { name: "Count games" }),
    ).toBeEnabled();
    expect(screen.getByTestId("game-count")).toHaveTextContent("?");
  });
});
