import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { NEON, PaletteContext, randomPair } from "./lib/palette";
import { AboutPage } from "./pages/AboutPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { HistoryPage } from "./pages/HistoryPage";
import { PlayPage } from "./pages/PlayPage";

export function App() {
  const [pair, setPair] = useState(() => randomPair());
  const palette = useMemo(
    () => ({ pair, reroll: () => setPair((p) => randomPair(Math.random, p)) }),
    [pair],
  );
  const style = { "--x": NEON[pair.x], "--o": NEON[pair.o] } as CSSProperties;

  return (
    <PaletteContext.Provider value={palette}>
      <div className="neon" style={style} data-pair={`${pair.x}-${pair.o}`}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<PlayPage />} />
              <Route path="analyze" element={<AnalyzePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </PaletteContext.Provider>
  );
}
