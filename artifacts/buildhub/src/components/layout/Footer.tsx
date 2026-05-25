import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                className="gradient-bg"
                style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Layers style={{ width: 15, height: 15, color: "#fff" }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", letterSpacing: "-0.02em" }}>
                Build<span className="gradient-text">Hub</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Trusted builder discovery. Rewarding proof of work, not self-promotion.
            </p>
          </div>

          {/* Nav groups */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
                Platform
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/builders", label: "Builders" },
                  { href: "/projects", label: "Projects" },
                  { href: "/request", label: "Hire a Builder" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
                Community
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/admin", label: "Admin" },
                  { href: "/builders", label: "Join as Builder" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} BuildHub. Nairobi, Kenya.
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Prove execution. Get discovered.
          </p>
        </div>
      </div>
    </footer>
  );
}
