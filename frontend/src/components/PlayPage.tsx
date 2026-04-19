import { useCallback, useEffect, useState } from "react";

import { postAnalyze, postBotMove } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "hard";
type GameStatus = "your-turn" | "bot-thinking" | "x-wins" | "o-wins" | "draw";

const EMPTY_BOARD = ".........";

export function PlayPage() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [status, setStatus] = useState<GameStatus>("your-turn");

  const checkGameOver = useCallback(async (currentBoard: string) => {
    const { data } = await postAnalyze({ body: { board: currentBoard } });
    if (!data) {
      return false;
    }
    if (data.score === 1) {
      setStatus("x-wins");
      return true;
    }
    if (data.score === -1) {
      setStatus("o-wins");
      return true;
    }
    if (data.score === 0) {
      setStatus("draw");
      return true;
    }
    return false;
  }, []);

  const doBotMove = useCallback(
    async (currentBoard: string) => {
      setStatus("bot-thinking");
      const { data } = await postBotMove({
        body: { board: currentBoard, difficulty },
      });
      if (!data) {
        return;
      }
      setBoard(data.board);
      const gameOver = await checkGameOver(data.board);
      if (!gameOver) {
        setStatus("your-turn");
      }
    },
    [difficulty, checkGameOver],
  );

  const handleCellClick = async (index: number) => {
    if (status !== "your-turn" || board[index] !== ".") {
      return;
    }

    const newBoard = board.slice(0, index) + "x" + board.slice(index + 1);
    setBoard(newBoard);

    const gameOver = await checkGameOver(newBoard);
    if (!gameOver) {
      await doBotMove(newBoard);
    }
  };

  const handleNewGame = () => {
    setBoard(EMPTY_BOARD);
    setStatus("your-turn");
  };

  // If difficulty changes mid-game, just keep playing
  useEffect(() => {
    // no-op, difficulty is read when bot moves
  }, [difficulty]);

  const isGameOver =
    status === "x-wins" || status === "o-wins" || status === "draw";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Play</h2>
        <p className="text-sm text-muted-foreground">
          Play tic-tac-toe against a bot. You are X and go first.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Difficulty:</span>
        <div className="flex gap-1">
          {(["easy", "hard"] as const).map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(d)}
              disabled={status === "bot-thinking"}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="grid grid-cols-3 gap-1">
          {Array.from(board).map((cell, i) => (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={status !== "your-turn" || cell !== "." || isGameOver}
              className={cn(
                "flex h-20 w-20 items-center justify-center border-2 rounded-md text-3xl font-bold transition-colors",
                "hover:bg-accent disabled:cursor-not-allowed",
                cell === "x" && "text-blue-600",
                cell === "o" && "text-red-600",
                status === "your-turn" &&
                  cell === "." &&
                  !isGameOver &&
                  "hover:border-primary",
              )}
            >
              {cell === "." ? "" : cell.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  status === "x-wins"
                    ? "default"
                    : status === "o-wins"
                      ? "destructive"
                      : "secondary"
                }
              >
                {status === "your-turn" && "Your Turn"}
                {status === "bot-thinking" && "Bot Thinking..."}
                {status === "x-wins" && "You Win!"}
                {status === "o-wins" && "Bot Wins!"}
                {status === "draw" && "Draw!"}
              </Badge>
            </CardContent>
          </Card>

          {isGameOver && <Button onClick={handleNewGame}>New Game</Button>}
        </div>
      </div>
    </div>
  );
}
