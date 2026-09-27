import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NeonBoard } from "./NeonBoard";

describe("NeonBoard", () => {
  it("renders nine named cells and reports clicks on empty ones", async () => {
    const onCell = vi.fn();
    render(<NeonBoard board="x...o...." onCell={onCell} />);

    expect(screen.getAllByRole("button")).toHaveLength(9);
    expect(screen.getByRole("button", { name: "Cell 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cell 5" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Cell 9" }));
    expect(onCell).toHaveBeenCalledWith(8);
  });

  it("lets the page decide which cells take a click", async () => {
    const onCell = vi.fn();
    const canClick = vi.fn(() => true);
    render(<NeonBoard board="x...o...." onCell={onCell} canClick={canClick} />);

    expect(screen.getByRole("button", { name: "Cell 1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cell 5" })).toBeEnabled();
    expect(canClick).toHaveBeenCalledWith(0, "x");
    expect(canClick).toHaveBeenCalledWith(4, "o");
    expect(canClick).toHaveBeenCalledWith(8, ".");

    await userEvent.click(screen.getByRole("button", { name: "Cell 1" }));
    expect(onCell).toHaveBeenCalledWith(0);
  });

  it("still locks every cell when disabled, whatever canClick says", () => {
    render(
      <NeonBoard
        board="x........"
        onCell={vi.fn()}
        canClick={() => true}
        disabled
      />,
    );
    const cells = screen.getAllByRole("button");
    expect(cells.filter((c) => c.hasAttribute("disabled"))).toHaveLength(9);
  });

  it("draws an X and an O glyph", () => {
    const { container } = render(
      <NeonBoard board="x...o...." onCell={vi.fn()} />,
    );
    expect(container.querySelectorAll(".glyph-x")).toHaveLength(1);
    expect(container.querySelectorAll(".glyph-o")).toHaveLength(1);
  });

  it("locks every cell when disabled", () => {
    render(<NeonBoard board="........." onCell={vi.fn()} disabled />);
    const cells = screen.getAllByRole("button");
    expect(cells.filter((c) => c.hasAttribute("disabled"))).toHaveLength(9);
  });

  it("draws the winning line in the winner's colour", () => {
    render(<NeonBoard board="xxxoo...." onCell={vi.fn()} />);
    const line = screen.getByTestId("winning-line");
    expect(line).toHaveClass("win-x");
    const tube = line.querySelector(".tube")!;
    // Row 0 runs from cell 0's centre (50, 50) to cell 2's (250, 50), padded by 36.
    expect(tube.getAttribute("x1")).toBe("14");
    expect(tube.getAttribute("x2")).toBe("286");
    expect(tube.getAttribute("y1")).toBe("50");
  });

  it("has no winning line mid-game", () => {
    render(<NeonBoard board="xo......." onCell={vi.fn()} />);
    expect(screen.queryByTestId("winning-line")).toBeNull();
  });

  it("is a plain picture without onCell", () => {
    render(<NeonBoard board="x........" size="mini" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByTestId("board")).toHaveClass("board-mini");
  });
});
