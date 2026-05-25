import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Layers, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../../lib/theme";
import { useUser, useClerk, Show } from "@clerk/react";

const links = [
  { href: "/builders", label: "Builders" },
  { href: "/projects", label: "Projects" },
  { href: "/startups", label: "Startups" },
  { href: "/request", label: "Hire a Builder" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: theme === "dark"
          ? "rgba(8, 9, 15, 0.82)"
          : "rgba(245, 244, 255, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            className="gradient-bg"
            style={{
              width: 34, height: 34, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Layers style={{ width: 17, height: 17, color: "#fff" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Build<span className="gradient-text">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, paddingLeft: 24 }}
          className="hidden md:flex"
        >
          {links.map((l) => {
            const active = location === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "6px 14px", borderRadius: 9,
                  fontSize: 14, fontWeight: 500, textDecoration: "none",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  background: active ? "var(--accent-subtle)" : "transparent",
                  transition: "all 160ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.background = "var(--surface-elevated)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ThemeToggle theme={theme} onToggle={toggle} />

          {/* Show when signed out */}
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex"
              style={{
                fontSize: 13, fontWeight: 500, color: "var(--text-muted)",
                textDecoration: "none", padding: "6px 12px", borderRadius: 8,
              }}
            >
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
              Join BuildHub
            </Link>
          </Show>

          {/* Show when signed in */}
          <Show when="signed-in">
            <Link
              href="/verify"
              className="hidden sm:inline-flex"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600,
                color: location.startsWith("/verify") ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none", padding: "6px 12px", borderRadius: 8,
              }}
            >
              <ShieldCheck style={{ width: 13, height: 13 }} />
              Get Verified
            </Link>
            <button
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              style={{
                fontSize: 13, fontWeight: 500, color: "var(--text-muted)",
                background: "none", border: "1px solid var(--border)",
                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                display: "none",
              }}
              className="sm:block hidden"
            >
              Sign Out
            </button>
            {user && (
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--gradient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  cursor: "pointer", flexShrink: 0,
                }}
                title={user.fullName || user.emailAddresses?.[0]?.emailAddress}
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
              >
                {(user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress || "?")[0].toUpperCase()}
              </div>
            )}
          </Show>

          {/* Mobile menu toggle */}
          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 9,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "12px 16px 20px",
          }}
          className="md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 9,
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                color: location === l.href ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Show when="signed-in">
            <Link
              href="/verify"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 12px", borderRadius: 9,
                fontSize: 14, fontWeight: 500, color: "var(--accent)", textDecoration: "none",
              }}
            >
              <ShieldCheck style={{ width: 14, height: 14 }} />
              Get Verified
            </Link>
            <button
              onClick={() => { signOut({ redirectUrl: basePath || "/" }); setMobileOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 12px", borderRadius: 9,
                fontSize: 14, fontWeight: 500, color: "var(--text-muted)",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 9,
                fontSize: 14, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 9,
                fontSize: 14, fontWeight: 700, color: "var(--accent)", textDecoration: "none",
              }}
            >
              Join BuildHub
            </Link>
          </Show>
        </div>
      )}
    </header>
  );
}
