import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Rocket, Eye, ArrowUp, PlusCircle, Megaphone, ChevronRight,
  ArrowUpRight, Pencil, Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

function StatBox({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ color: "var(--accent)" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{value}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function StartupPortal() {
  const { user } = useUser();
  const firstName = user?.firstName || "Founder";

  const { data: myStartupData, isLoading } = useQuery({
    queryKey: ["my-startup"],
    queryFn: () => apiFetch("/api/startups/my/startup"),
    staleTime: 60_000,
  });

  const startup = myStartupData?.startup ?? null;

  const { data: updatesData } = useQuery({
    queryKey: ["startup-updates", startup?.id],
    queryFn: () => apiFetch(`/api/startups/${startup?.id}/updates`),
    enabled: !!startup?.id,
    staleTime: 60_000,
  });

  const updates = updatesData?.updates ?? [];

  const updateTypeStyle: Record<string, { bg: string; color: string; border: string }> = {
    shipped: { bg: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" },
    milestone: { bg: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent)" },
    looking_for: { bg: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" },
    setback: { bg: "rgba(225,29,72,0.08)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.2)" },
    general: { bg: "var(--surface-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" },
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading your startup…</div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>Startup Portal</div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: "0 0 12px" }}>
            Welcome, {firstName}
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)", margin: 0 }}>
            You haven't listed a startup yet. Add yours to get visibility in the East African tech scene.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <Link href="/startups/new" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, padding: "14px 32px" }}>
            <Rocket style={{ width: 16, height: 16 }} /> List Your Startup
          </Link>
        </div>

        <div className="card" style={{ padding: 32, textAlign: "center", border: "2px dashed var(--border)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Rocket style={{ width: 26, height: 26, color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
            Your startup portal awaits
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Once you list your startup, you'll see live stats (views, upvotes), post product updates,
            manage your team, and access paid marketing packages.
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            {["Live view & upvote tracking", "Post product updates", "Featured marketing slots", "Team management"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                <Zap style={{ width: 12, height: 12, color: "var(--accent)" }} /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>Startup Portal</div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>
            {startup.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0" }}>
            {startup.tagline}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/startups/${startup.slug}`} className="btn btn-ghost" style={{ fontSize: 13, padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowUpRight style={{ width: 14, height: 14 }} /> Public Page
          </Link>
          <Link href={`/startups/${startup.slug}/promote`} className="btn btn-primary" style={{ fontSize: 13, padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}>
            <Megaphone style={{ width: 14, height: 14 }} /> Promote
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatBox label="Total Views" value={startup.total_views ?? 0} icon={<Eye style={{ width: 16, height: 16 }} />} />
        <StatBox label="Upvotes" value={startup.total_upvotes ?? 0} icon={<ArrowUp style={{ width: 16, height: 16 }} />} />
        <StatBox label="Updates Posted" value={updates.length} icon={<Pencil style={{ width: 16, height: 16 }} />} />
        <StatBox label="Stage" value={startup.stage} icon={<Rocket style={{ width: 16, height: 16 }} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Updates */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>
              Recent Updates
            </h2>
            <Link href={`/startups/${startup.slug}`} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Post update <ChevronRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {updates.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: "center", border: "2px dashed var(--border)" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                No updates yet.<br />Share what you've shipped or what you're working on.
              </div>
              <Link href={`/startups/${startup.slug}`} className="btn btn-primary" style={{ marginTop: 14, fontSize: 12, padding: "8px 16px", display: "inline-block" }}>
                Post First Update
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {updates.slice(0, 4).map((u: any) => {
                const style = updateTypeStyle[u.update_type] || updateTypeStyle.general;
                return (
                  <div key={u.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span className="badge" style={{ ...style, fontSize: 10, textTransform: "capitalize" }}>{u.update_type}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{u.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                      {u.body}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Marketing & quick actions */}
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
            Marketing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Featured Listing", price: "$29/mo", desc: "Highlighted in the startup directory", slug: "featured" },
              { title: "Startup Spotlight", price: "$79/mo", desc: "Featured on the BuildHub homepage", slug: "spotlight" },
              { title: "Startup of the Week", price: "$149/wk", desc: "Hero placement across the platform", slug: "startup-of-week" },
            ].map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/startups/${startup.slug}/promote`}
                className="card card-interactive"
                style={{ padding: 16, textDecoration: "none", display: "block" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{pkg.title}</div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "var(--accent)" }}>{pkg.price}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{pkg.desc}</div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
              Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href={`/startups/${startup.slug}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <Pencil style={{ width: 14, height: 14 }} /> Post an Update
              </Link>
              <Link href="/startups" className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpRight style={{ width: 14, height: 14 }} /> View Startup Directory
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
