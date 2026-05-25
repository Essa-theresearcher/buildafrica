import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Package, Users, ChevronRight } from "lucide-react";
import { builders, projects, getBuildersByIds } from "../data/seed";
import { ReputationBadge } from "../components/builders/ReputationBadge";
import { getInitials } from "../data/seed";

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <div className={`${sz} flex flex-shrink-0 items-center justify-center rounded-xl gradient-bg font-bold text-white`}>
      {getInitials(name)}
    </div>
  );
}

const stats = [
  { label: "Verified Builders", value: "6", icon: ShieldCheck },
  { label: "Projects Shipped", value: "6", icon: Package },
  { label: "Companies Served", value: "12", icon: Users },
];

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
const featuredBuilders = builders.filter((b) => b.verificationStatus === "Verified").slice(0, 4);

const statusColors: Record<string, string> = {
  Idea: "status-idea",
  Building: "status-building",
  Launched: "status-launched",
  Verified: "status-verified",
};

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/60 px-6 py-20 sm:px-12 sm:py-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--accent-blue)]/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-elevated)] px-4 py-1.5 text-xs font-medium text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            Trusted Builder Discovery · Nairobi, Kenya
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--text)] sm:text-6xl">
            BuildHub helps serious builders{" "}
            <span className="gradient-text">prove execution</span> and get
            discovered for real opportunities.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            No self-promotion. No leaderboards. Just verified proof of work, shipped projects, and a trusted community of builders who deliver.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/builders" className="btn-primary">
              Join as Builder
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/builders" className="btn-outline">
              Find Builders
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10">
              <Icon className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--text)]">{value}</div>
              <div className="text-sm text-[var(--text-muted)]">{label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* What makes this different */}
      <section>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Rewarding proof of work, not self-promotion
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-muted)]">
            Every signal on BuildHub answers one question: Can this person actually build and deliver reliably?
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Verified Execution",
              desc: "Builders are verified based on shipped projects, not resumes or portfolios.",
              icon: ShieldCheck,
            },
            {
              title: "Collaboration History",
              desc: "See who has shipped products together. Team track records, not just individuals.",
              icon: Users,
            },
            {
              title: "Shipped Projects",
              desc: "Every project is documented with tech stack, contribution details, and live demos.",
              icon: Package,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <div key={title} className="card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="mb-2 font-semibold text-[var(--text)]">{title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Featured Projects</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Real products built by the community</p>
          </div>
          <Link href="/projects" className="flex items-center gap-1 text-sm text-[var(--accent)] no-underline hover:text-[var(--accent-hover)]">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {featuredProjects.map((project) => {
            const projectBuilders = getBuildersByIds(project.builderIds);
            return (
              <Link key={project.id} href={`/projects`} className="card block p-5 no-underline">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--text)]">{project.name}</h3>
                  <span className={`badge ${statusColors[project.status]} flex-shrink-0`}>
                    {project.status}
                  </span>
                </div>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {project.description}
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="rounded-md bg-[var(--surface-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-[var(--border-color)] pt-3 text-xs text-[var(--text-muted)]">
                  <div className="flex -space-x-1">
                    {projectBuilders.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--surface)] bg-[var(--accent)] text-[9px] font-bold text-white">
                        {getInitials(b.name)}
                      </div>
                    ))}
                  </div>
                  <span>{projectBuilders.map((b) => b.name.split(" ")[0]).join(", ")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Builders */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Verified Builders</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Community-verified, ready to build</p>
          </div>
          <Link href="/builders" className="flex items-center gap-1 text-sm text-[var(--accent)] no-underline hover:text-[var(--accent-hover)]">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredBuilders.map((builder) => (
            <Link key={builder.id} href={`/builders/${builder.username}`} className="card flex items-start gap-4 p-4 no-underline">
              <Avatar name={builder.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text)]">{builder.name}</span>
                  {builder.verificationStatus === "Verified" && (
                    <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                  )}
                </div>
                <div className="text-sm text-[var(--text-muted)]">{builder.role}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{builder.location}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {builder.tags.slice(0, 2).map((tag) => (
                    <ReputationBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                builder.availability === "Available"
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : builder.availability === "Limited"
                  ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                  : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
              }`}>
                {builder.availability}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
          Looking for a reliable builder?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
          Submit your requirements and we'll match you with the right builder from our verified community.
        </p>
        <Link href="/request" className="btn-primary mx-auto mt-8 inline-flex">
          Submit a Builder Request
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
