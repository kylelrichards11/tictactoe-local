import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { postBotMove } from "@/client";
import { PaletteContext } from "@/lib/palette";
import { HISTORY_KEY, SCORES_KEY } from "@/lib/storage";

import { PlayPage } from "./PlayPage";

vi.mock("@/client", () => ({ postBotMove: vi.fn() }));

const reroll = vi.fn();

function renderPlay(url = "/?seed=42") {
  return render(
    <PaletteContext.Provider
      value={{ pair: { x: "cyan", o: "magenta" }, reroll }}
    >
      <MemoryRouter initialEntries={[url]}>
        <PlayPage />
      </MemoryRouter>
    </PaletteContext.Provider>,
  );
}

const cell = (n: number) => screen.getByRole("button", { name: `Cell ${n}` });
const status = () => screen.getByRole("status");

async function playAndWait(n: number) {
  await userEvent.click(cell(n));
  await waitFor(() =>
    expect(status()).not.toHaveTextContent("Bot is thinking…"),
  );
}

beforeEach(() => {
  vi.mocked(postBotMove).mockReset();
  reroll.mockReset();
});

describe("PlayPage", () => {
  it("wins against the seeded easy bot and keeps score", async () => {
    renderPlay();
    expect(status()).toHaveTextContent("Your move");

    await userEvent.click(cell(1));
    expect(status()).toHaveTextContent("Bot is thinking…");
    await waitFor(() => expect(status()).toHaveTextContent("Your move"));
    // Seed 42's easy bot answers cell 1 with cell 6, then cell 2 with cell 5.
    expect(cell(6)).toBeDisabled();
    await playAndWait(2);
    expect(cell(5)).toBeDisabled();
    await userEvent.click(cell(3));

    expect(status()).toHaveTextContent("X wins");
    expect(screen.getByTestId("winning-line")).toHaveClass("win-x");
    expect(screen.getByTestId("score-you")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem(SCORES_KEY)!)).toEqual({
      you: 1,
      draws: 0,
      bot: 0,
    });
    const [record] = JSON.parse(localStorage.getItem(HISTORY_KEY)!);
    expect(record).toMatchObject({
      outcome: "x",
      difficulty: "easy",
      moves: 5,
    });
    expect(postBotMove).not.toHaveBeenCalled();
  });

  it("refuses clicks on filled cells", async () => {
    renderPlay();
    await playAndWait(1);
    // Seed 42's easy bot answers cell 1 with cell 6.
    expect(cell(1)).toBeDisabled();
    expect(cell(6)).toBeDisabled();
    expect(cell(2)).toBeEnabled();

    await userEvent.click(cell(1));
    expect(status()).toHaveTextContent("Your move");
    expect(cell(1).querySelector(".glyph-x")).not.toBeNull();
  });

  it("ignores clicks while the bot thinks", async () => {
    renderPlay();
    await userEvent.click(cell(1));
    expect(cell(9)).toBeDisabled();
    await waitFor(() => expect(status()).toHaveTextContent("Your move"));
  });

  it("asks the API for the hard bot's move and records its win", async () => {
    vi.mocked(postBotMove).mockImplementation(async ({ body }) => {
      const replies: Record<string, string> = {
        "x........": "x...o....",
        "xx..o....": "xxo.o....",
        "xxo.o...x": "xxo.o.o.x",
      };
      return { data: { board: replies[body.board] } } as never;
    });
    renderPlay("/");

    await userEvent.click(screen.getByRole("button", { name: "Hard" }));
    expect(screen.getByRole("button", { name: "Hard" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await playAndWait(1);
    await playAndWait(2);
    await playAndWait(9);

    expect(status()).toHaveTextContent("O wins");
    expect(postBotMove).toHaveBeenCalledWith({
      body: { board: "x........", difficulty: "hard" },
    });
    expect(screen.getByTestId("score-bot")).toHaveTextContent("1");
  });

  it("says so when the bot's API is down", async () => {
    vi.mocked(postBotMove).mockResolvedValue({ data: undefined } as never);
    renderPlay("/");
    await userEvent.click(screen.getByRole("button", { name: "Hard" }));
    await playAndWait(5);
    expect(status()).toHaveTextContent("Bot is offline, start the API");
  });

  it("scores a draw", async () => {
    vi.mocked(postBotMove).mockImplementation(async ({ body }) => {
      const replies: Record<string, string> = {
        "....x....": "o...x....",
        "ox..x....": "ox..x..o.",
        "ox.xx..o.": "ox.xxo.o.",
        "oxxxxo.o.": "oxxxxooo.",
      };
      return { data: { board: replies[body.board] } } as never;
    });
    renderPlay("/");
    await userEvent.click(screen.getByRole("button", { name: "Hard" }));
    for (const n of [5, 2, 4, 3]) {
      await playAndWait(n);
    }
    await userEvent.click(cell(9));
    expect(status()).toHaveTextContent("Draw");
    expect(screen.getByTestId("score-draws")).toHaveTextContent("1");
  });

  it("starts a new game with a new neon pair", async () => {
    renderPlay();
    await playAndWait(1);
    await userEvent.click(screen.getByRole("button", { name: "New game" }));

    expect(reroll).toHaveBeenCalledTimes(1);
    expect(status()).toHaveTextContent("Your move");
    expect(cell(1)).toBeEnabled();
  });

  it("resets the scores", async () => {
    localStorage.setItem(
      SCORES_KEY,
      JSON.stringify({ you: 4, draws: 1, bot: 2 }),
    );
    renderPlay();
    expect(screen.getByTestId("score-you")).toHaveTextContent("4");

    await userEvent.click(screen.getByRole("button", { name: "Reset scores" }));
    expect(screen.getByTestId("score-you")).toHaveTextContent("0");
    expect(screen.getByTestId("score-bot")).toHaveTextContent("0");
  });
});
