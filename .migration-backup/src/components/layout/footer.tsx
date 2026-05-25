import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ba-border bg-ba-surface/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-ba-text-muted">
          © {new Date().getFullYear()} BuildAfrica — Proof of work for African builders.
        </p>
        <div className="flex gap-6 text-sm text-ba-text-muted">
          <Link href="/explore" className="hover:text-ba-text">
            Explore
          </Link>
          <Link href="/auth/signup" className="hover:text-ba-text">
            Join as Builder
          </Link>
        </div>
      </div>
    </footer>
  );
}
