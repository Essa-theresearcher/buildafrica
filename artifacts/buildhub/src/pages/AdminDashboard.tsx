import { useState } from "react";
import { Link } from "wouter";
import {
  Users, Package, Briefcase, ShieldCheck, Eye,
  CheckCheck, X, LayoutDashboard, MessageSquare, ChevronRight
} from "lucide-react";
import { builders, projects, companyRequests, getBuildersByIds, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import type { Builder, CompanyRequest } from "../types";

const tabs = ["Overview", "Builders", "Company Requests"] as const;
type Tab = typeof tabs[number];

const statusRequestColors: Record<string, string> = {
  New: "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]",
  Reviewed: "bg-[var(--warning)]/10 text-[var(--warning)]",
  Matched: "bg-[var(--success)]/10 text-[var(--success)]",
  Closed: "bg-[var(--surface-elevated)] text-[var(--text-muted)]",
};

const verifyColors: Record<string, string> = {
  Verified: "bg-[var(--accent)]/10 text-[var(--accent)]",
  Pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  Unverified: "bg-[var(--surface-elevated)] text-[var(--text-muted)]",
};

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  return (
    <div className="card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent || "bg-[var(--accent)]/10"}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-white" : "text-[var(--accent)]"}`} />
      </div>
      <div className="text-2xl font-bold text-[var(--text)]">{value}</div>
      <div className="mt-0.5 text-sm text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function BuildersTab() {
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(builders.map((b) => [b.id, b.adminNotes || ""]))
  );
  const [verifications, setVerifications] = useState<Record<string, Builder["verificationStatus"]>>(
    Object.fromEntries(builders.map((b) => [b.id, b.verificationStatus]))
  );
  const [saved, setSaved] = useState<string | null>(null);

  const saveNote = (id: string) => {
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="space-y-4">
      {builders.map((builder) => (
        <div key={builder.id} className="card p-5">
          <div className="mb-4 flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl gradient-bg text-base font-bold text-white">
              {getInitials(builder.name)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/builders/${builder.username}`} className="font-semibold text-[var(--text)] no-underline hover:text-[var(--accent)]">
                  {builder.name}
                </Link>
                <span className="text-sm text-[var(--text-muted)]">· {builder.role}</span>
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  builder.availability === "Available"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : builder.availability === "Limited"
                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                    : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                }`}>
                  {builder.availability}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {builder.tags.slice(0, 3).map((tag) => (
                  <ReputationBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Verification:</span>
            {(["Verified", "Pending", "Unverified"] as Builder["verificationStatus"][]).map((v) => (
              <button
                key={v}
                onClick={() => setVerifications((prev) => ({ ...prev, [builder.id]: v }))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  verifications[builder.id] === v
                    ? verifyColors[v]
                    : "border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {v === "Verified" && <CheckCheck className="mr-1 inline h-3 w-3" />}
                {v === "Unverified" && <X className="mr-1 inline h-3 w-3" />}
                {v}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Admin Notes</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Add reliability notes, performance observations..."
              value={notes[builder.id]}
              onChange={(e) => setNotes((prev) => ({ ...prev, [builder.id]: e.target.value }))}
            />
            <button
              onClick={() => saveNote(builder.id)}
              className="btn-ghost mt-2 text-xs"
            >
              {saved === builder.id ? "✓ Saved" : "Save notes"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestsTab() {
  const [statuses, setStatuses] = useState<Record<string, CompanyRequest["status"]>>(
    Object.fromEntries(companyRequests.map((r) => [r.id, r.status]))
  );
  const [matchInputs, setMatchInputs] = useState<Record<string, string>>(
    Object.fromEntries(companyRequests.map((r) => [r.id, (r.matchedBuilderIds || []).join(", ")]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(companyRequests.map((r) => [r.id, r.adminNotes || ""]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {companyRequests.map((req) => {
        const matchedBuilders = getBuildersByIds(req.matchedBuilderIds || []);
        const isExpanded = expanded === req.id;
        return (
          <div key={req.id} className="card overflow-hidden">
            <div
              className="flex cursor-pointer items-start gap-4 p-5"
              onClick={() => setExpanded(isExpanded ? null : req.id)}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--text)]">{req.companyName}</span>
                  <span className="text-sm text-[var(--text-muted)]">· {req.roleNeeded}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${statusRequestColors[statuses[req.id]]}`}>
                    {statuses[req.id]}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {req.skillsRequired.map((s) => (
                    <span key={s} className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                  <span>💰 {req.budgetRange}</span>
                  <span>⏱ {req.timeline}</span>
                  <span>{req.remote ? "🌐 Remote" : `📍 ${req.location}`}</span>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </div>

            {isExpanded && (
              <div className="border-t border-[var(--border-color)] p-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={statuses[req.id]}
                      onChange={(e) => setStatuses((prev) => ({ ...prev, [req.id]: e.target.value as CompanyRequest["status"] }))}
                      className="input"
                    >
                      {["New", "Reviewed", "Matched", "Closed"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Contact</label>
                    <div className="input flex items-center gap-2 bg-[var(--surface-elevated)] text-sm">
                      <span>{req.contactEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Matched Builders</label>
                  {matchedBuilders.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {matchedBuilders.map((b) => (
                        <Link key={b.id} href={`/builders/${b.username}`} className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-1 text-sm text-[var(--accent)] no-underline">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full gradient-bg text-[9px] font-bold text-white">
                            {getInitials(b.name)}
                          </div>
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Builder IDs (b1, b2, b3...)"
                    value={matchInputs[req.id]}
                    onChange={(e) => setMatchInputs((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Available: {builders.map((b) => `${b.id} (${b.name.split(" ")[0]})`).join(", ")}</p>
                </div>

                <div>
                  <label className="label">Admin Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Matching notes, intro status..."
                    value={notes[req.id]}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const verified = builders.filter((b) => b.verificationStatus === "Verified").length;
  const pending = builders.filter((b) => b.verificationStatus === "Pending").length;
  const newRequests = companyRequests.filter((r) => r.status === "New").length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
          <LayoutDashboard className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage builders, verify profiles, match companies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--surface-elevated)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Builders" value={builders.length} icon={Users} />
            <StatCard label="Verified Builders" value={verified} icon={ShieldCheck} />
            <StatCard label="Projects Shipped" value={projects.length} icon={Package} />
            <StatCard label="Open Requests" value={newRequests} icon={Briefcase} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Pending builders */}
            <div className="card p-5">
              <h3 className="mb-4 font-semibold text-[var(--text)]">
                Pending Verification
                {pending > 0 && (
                  <span className="ml-2 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs text-[var(--warning)]">
                    {pending}
                  </span>
                )}
              </h3>
              {builders.filter((b) => b.verificationStatus === "Pending").length > 0 ? (
                <div className="space-y-3">
                  {builders.filter((b) => b.verificationStatus === "Pending").map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg text-xs font-bold text-white">
                        {getInitials(b.name)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text)]">{b.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{b.role}</div>
                      </div>
                      <button
                        onClick={() => setActiveTab("Builders")}
                        className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
                      >
                        Review <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">All builders reviewed.</p>
              )}
            </div>

            {/* New company requests */}
            <div className="card p-5">
              <h3 className="mb-4 font-semibold text-[var(--text)]">
                New Company Requests
                {newRequests > 0 && (
                  <span className="ml-2 rounded-full bg-[var(--accent-blue)]/10 px-2 py-0.5 text-xs text-[var(--accent-blue)]">
                    {newRequests}
                  </span>
                )}
              </h3>
              {companyRequests.filter((r) => r.status === "New").length > 0 ? (
                <div className="space-y-3">
                  {companyRequests.filter((r) => r.status === "New").map((req) => (
                    <div key={req.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10 text-xs font-bold text-[var(--accent-blue)]">
                        {req.companyName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text)]">{req.companyName}</div>
                        <div className="text-xs text-[var(--text-muted)]">{req.roleNeeded}</div>
                      </div>
                      <button
                        onClick={() => setActiveTab("Company Requests")}
                        className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
                      >
                        Match <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No new requests.</p>
              )}
            </div>
          </div>

          {/* Recent projects */}
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-[var(--text)]">Recent Projects</h3>
            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => {
                const team = getBuildersByIds(p.builderIds);
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                      <Package className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--text)]">{p.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {team.map((b) => b.name.split(" ")[0]).join(", ")}
                      </div>
                    </div>
                    <span className={`badge ${
                      p.status === "Verified" ? "status-verified" :
                      p.status === "Launched" ? "status-launched" :
                      p.status === "Building" ? "status-building" : "status-idea"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Builders" && <BuildersTab />}
      {activeTab === "Company Requests" && <RequestsTab />}
    </div>
  );
}
