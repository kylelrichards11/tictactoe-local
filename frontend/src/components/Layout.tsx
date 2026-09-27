import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Play" },
  { to: "/analyze", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export function Layout() {
  return (
    <div className="shell">
      <header className="header">
        <NavLink to="/" className="logo" aria-label="Tic Tac Toe home">
          <span className="logo-x">TIC</span>
          <span className="logo-dot">·</span>
          <span className="logo-o">TAC</span>
          <span className="logo-dot">·</span>
          <span className="logo-x">TOE</span>
        </NavLink>
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
