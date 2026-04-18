import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postAnalyze } from "@/client";

import { BoardInput } from "./BoardInput";

function scoreLabel(score: number | null): string {
  if (score === 1) {
    return "X Wins";
  }
  if (score === -1) {
    return "O Wins";
  }
  if (score === 0) {
    return "Draw";
  }
  return "Game in Progress";
}

function scoreVariant(
  score: number | null,
): "default" | "secondary" | "destructive" | "outline" {
  if (score === 1) {
    return "default";
  }
  if (score === -1) {
    return "destructive";
  }
  if (score === 0) {
    return "secondary";
  }
  return "outline";
}

export function AnalysisPage() {
  const [board, setBoard] = useState(".........");
  const [result, setResult] = useState<{
    score: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data } = await postAnalyze({ body: { board } });
      if (data) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Analyze Board</h2>
        <p className="text-sm text-muted-foreground">
          Click cells to set X or O, then analyze the board state.
        </p>
      </div>

      <div className="flex gap-8">
        <BoardInput value={board} onChange={setBoard} disabled={loading} />

        <div className="flex flex-col gap-4">
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </Button>

          {result !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge variant={scoreVariant(result.score)}>
                    {scoreLabel(result.score)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Score: {result.score ?? "null"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
