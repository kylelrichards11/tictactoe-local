import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { NEON } from "./lib/palette";

vi.mock("@/client", () => ({
  postBotMove: vi.fn(),
  postAnalyze: vi.fn(async () => ({ data: undefined })),
  postEvaluate: vi.fn(async () => ({ data: undefined })),
  postNextStates: vi.fn(async () => ({ data: undefined })),
  getCountGames: vi.fn(),
}));

describe("App", () => {
  it("opens on Play and navigates between pages", async () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("Your move");

    await userEvent.click(screen.getByRole("link", { name: "Analyze" }));
    expect(screen.getByRole("heading", { name: "Analyze" })).toBeVisible();

    await userEvent.click(screen.getByRole("link", { name: "History" }));
    expect(screen.getByRole("heading", { name: "No games yet" })).toBeVisible();
    expect(screen.getByRole("link", { name: "History" })).toHaveClass("active");
  });

  it("paints the board in a neon pair and re-rolls it for a new game", async () => {
    const { container } = render(<App />);
    const shell = container.querySelector<HTMLElement>(".neon")!;
    const before = shell.dataset.pair!;
    const [x, o] = before.split("-") as (keyof typeof NEON)[];
    expect(shell.style.getPropertyValue("--x")).toBe(NEON[x]);
    expect(shell.style.getPropertyValue("--o")).toBe(NEON[o]);

    await userEvent.click(screen.getByRole("link", { name: "Play" }));
    await userEvent.click(screen.getByRole("button", { name: "New game" }));
    expect(shell.dataset.pair).not.toBe(before);
  });
});
