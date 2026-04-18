import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCountGames } from "@/client";

export function CountGamesPage() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCount = async () => {
    setLoading(true);
    try {
      const { data } = await getCountGames();
      if (data) {
        setCount(data.count);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Count Games</h2>
        <p className="text-sm text-muted-foreground">
          Count the total number of possible tic-tac-toe games. This explores
          all legal game sequences from an empty board.
        </p>
      </div>

      <Button onClick={handleCount} disabled={loading}>
        {loading ? "Counting..." : "Count Games"}
      </Button>

      {count !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Legal Games</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{count.toLocaleString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
