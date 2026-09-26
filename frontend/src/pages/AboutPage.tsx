import { Glyph } from "@/components/Glyph";

// demo gap: no unit test renders this page, so verifAIed lists it as untested.
export function AboutPage() {
  return (
    <div className="about">
      <div className="about-mark" aria-hidden="true">
        <Glyph mark="x" />
        <Glyph mark="o" />
      </div>
      <h1 className="title">About</h1>
      <p className="lede">
        A tiny tic-tac-toe game, glowing like a sign in the dark. Play the bot,
        pull apart a position, and keep score.
      </p>
      <p>
        It is the demo repository for{" "}
        <a
          className="link"
          href="https://verifaied.app"
          target="_blank"
          rel="noreferrer"
        >
          verifAIed
        </a>
        , which reads its test coverage and shows, function by function, what
        the tests actually exercise, including the gaps left here on purpose.
      </p>
      <ul className="stack">
        <li>FastAPI + minimax</li>
        <li>React + Vite</li>
        <li>pytest + vitest</li>
        <li>Playwright</li>
      </ul>
    </div>
  );
}
