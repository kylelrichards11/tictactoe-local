import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Scoreboard } from "./Scoreboard";

describe("Scoreboard", () => {
  it("shows the three tallies and resets", async () => {
    const onReset = vi.fn();
    render(
      <Scoreboard scores={{ you: 3, draws: 2, bot: 1 }} onReset={onReset} />,
    );

    expect(screen.getByTestId("score-you")).toHaveTextContent("3");
    expect(screen.getByTestId("score-draws")).toHaveTextContent("2");
    expect(screen.getByTestId("score-bot")).toHaveTextContent("1");

    await userEvent.click(screen.getByRole("button", { name: "Reset scores" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
