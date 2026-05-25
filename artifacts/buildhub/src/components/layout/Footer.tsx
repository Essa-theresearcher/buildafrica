import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--surface)]/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-bg">
            <Layers className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text)]">
            Build<span className="gradient-text">Hub</span>
          </span>
          <span className="text-sm text-[var(--text-muted)]">— Trusted builder discovery for serious opportunities.</span>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--text-muted)]">
          <Link href="/builders" className="no-underline hover:text-[var(--text)]">Builders</Link>
          <Link href="/projects" className="no-underline hover:text-[var(--text)]">Projects</Link>
          <Link href="/request" className="no-underline hover:text-[var(--text)]">Hire a Builder</Link>
          <Link href="/admin" className="no-underline hover:text-[var(--text)]">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
