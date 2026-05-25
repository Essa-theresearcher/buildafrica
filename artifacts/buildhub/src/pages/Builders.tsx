import { useState } from "react";
import { Link } from "wouter";
import { Search, ShieldCheck, MapPin, Briefcase } from "lucide-react";
import { builders, projects, getInitials } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import type { Builder } from "../types";

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl gradient-bg text-lg font-bold text-white">
      {getInitials(name)}
    </div>
  );
}

function BuilderCard({ builder }: { builder: Builder }) {
  const builderProjects = projects.filter((p) => p.builderIds.includes(builder.id));
  return (
    <Link
      href={`/builders/${builder.username}`}
      className="card block p-5 no-underline"
    >
      <div className="mb-4 flex items-start gap-4">
        <Avatar name={builder.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text)]">{builder.name}</span>
            {builder.verificationStatus === "Verified" && (
              <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            )}
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
                builder.availability === "Available"
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : builder.availability === "Limited"
                  ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                  : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
              }`}
            >
              {builder.availability}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-sm text-[var(--text-muted)]">
            <Briefcase className="h-3.5 w-3.5" />
            {builder.role}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MapPin className="h-3 w-3" />
            {builder.location}
          </div>
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
        {builder.bio}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {builder.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
          >
            {skill}
          </span>
        ))}
        {builder.skills.length > 4 && (
          <span className="rounded-md bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
            +{builder.skills.length - 4}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {builder.tags.slice(0, 3).map((tag) => (
          <ReputationBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-muted)]">
        <span>{builderProjects.length} project{builderProjects.length !== 1 ? "s" : ""} shipped</span>
        <span className="text-[var(--accent)]">View profile →</span>
      </div>
    </Link>
  );
}

export default function Builders() {
  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState("all");
  const [filterVerified, setFilterVerified] = useState(false);

  const filtered = builders.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.role.toLowerCase().includes(q) ||
      b.skills.some((s) => s.toLowerCase().includes(q));
    const matchesAvail =
      filterAvail === "all" || b.availability === filterAvail;
    const matchesVerified =
      !filterVerified || b.verificationStatus === "Verified";
    return matchesSearch && matchesAvail && matchesVerified;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Builders Directory</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Vetted builders who've shipped real products. Browse by skill, availability, or verification status.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search by name, role, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterAvail}
          onChange={(e) => setFilterAvail(e.target.value)}
          className="input sm:w-44"
        >
          <option value="all">All availability</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Unavailable">Unavailable</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={filterVerified}
            onChange={(e) => setFilterVerified(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Verified only
        </label>
      </div>

      <div className="mb-4 text-sm text-[var(--text-muted)]">
        {filtered.length} builder{filtered.length !== 1 ? "s" : ""}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BuilderCard key={b.id} builder={b} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-[var(--text-muted)]">
          No builders match your search.
        </div>
      )}
    </div>
  );
}
