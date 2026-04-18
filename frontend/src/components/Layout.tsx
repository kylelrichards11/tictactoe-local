import { Link, Outlet, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Analysis" },
  { path: "/next-states", label: "Next States" },
  { path: "/count-games", label: "Count Games" },
  { path: "/play", label: "Play" },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-8 px-6 py-4">
          <h1 className="text-xl font-bold">Tic-Tac-Toe Analysis</h1>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
