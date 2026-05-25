import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Layers } from "lucide-react";

const links = [
  { href: "/builders", label: "Builders" },
  { href: "/projects", label: "Projects" },
  { href: "/request", label: "Hire a Builder" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-[var(--text)] no-underline"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <span>
            Build<span className="gradient-text">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors ${
                location === l.href
                  ? "bg-[var(--surface-elevated)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/admin" className="btn-ghost hidden text-xs sm:inline-flex">
            Admin
          </Link>
          <Link href="/builders" className="btn-primary text-sm">
            Join as Builder
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg)] px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
