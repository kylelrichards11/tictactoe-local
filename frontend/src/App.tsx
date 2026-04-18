import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AnalysisPage } from "./components/AnalysisPage";
import { CountGamesPage } from "./components/CountGamesPage";
import { Layout } from "./components/Layout";
import { NextStatesPage } from "./components/NextStatesPage";
import { PlayPage } from "./components/PlayPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<AnalysisPage />} />
          <Route path="next-states" element={<NextStatesPage />} />
          <Route path="count-games" element={<CountGamesPage />} />
          <Route path="play" element={<PlayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
