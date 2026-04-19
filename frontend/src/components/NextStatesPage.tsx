import { useState } from "react";

import { postNextStates } from "@/client";
import { Button } from "@/components/ui/button";

import { BoardDisplay } from "./BoardDisplay";
import { BoardInput } from "./BoardInput";

export function NextStatesPage() {
  const [board, setBoard] = useState(".........");
  const [nextStates, setNextStates] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetNextStates = async () => {
    setLoading(true);
    try {
      const { data } = await postNextStates({ body: { board } });
      if (data) {
        setNextStates(data.next_states);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Next States</h2>
        <p className="text-sm text-muted-foreground">
          Set up a board and see all possible next moves.
        </p>
      </div>

      <div className="flex gap-8">
        <BoardInput value={board} onChange={setBoard} disabled={loading} />

        <Button onClick={handleGetNextStates} disabled={loading}>
          {loading ? "Loading..." : "Get Next States"}
        </Button>
      </div>

      {nextStates !== null && (
        <div>
          <p className="mb-3 text-sm font-medium">
            {nextStates.length} legal move{nextStates.length !== 1 && "s"}
          </p>
          <div className="flex flex-wrap gap-4">
            {nextStates.map((state, i) => (
              <div key={i} className="rounded-lg border p-2">
                <BoardDisplay board={state} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
