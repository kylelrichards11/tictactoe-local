import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { HISTORY_KEY } from "@/lib/storage";

import { HistoryPage } from "./HistoryPage";

const renderHistory = () =>
  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  );

describe("HistoryPage", () => {
  it("invites you to play when there is nothing yet", () => {
    renderHistory();
    expect(screen.getByRole("heading", { name: "No games yet" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Play a game" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("lists games with a summary, then clears them", async () => {
    const now = Date.now();
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { outcome: "draw", difficulty: "hard", moves: 9, at: now - 1000 },
        { outcome: "x", difficulty: "easy", moves: 5, at: now - 2000 },
        { outcome: "o", difficulty: "hard", moves: 6, at: now - 3000 },
      ]),
    );
    renderHistory();

    expect(screen.getByTestId("games-played")).toHaveTextContent("3");
    expect(screen.getByTestId("hard-win-rate")).toHaveTextContent("0%");
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows.map((r) => r.textContent)).toEqual([
      "DrawHard91 second ago",
      "WinEasy52 seconds ago",
      "LossHard63 seconds ago",
    ]);

    await userEvent.click(
      screen.getByRole("button", { name: "Clear history" }),
    );
    expect(screen.getByRole("heading", { name: "No games yet" })).toBeVisible();
  });

  it("shows a dash when no hard games were played", () => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { outcome: "x", difficulty: "easy", moves: 5, at: Date.now() },
      ]),
    );
    renderHistory();
    expect(screen.getByTestId("hard-win-rate")).toHaveTextContent("–");
  });
});
