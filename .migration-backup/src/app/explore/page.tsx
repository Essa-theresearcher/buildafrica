import { Suspense } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { PROJECT_CATEGORIES } from "@/lib/types";
import { getProjects } from "@/lib/data";
import type { SortOption } from "@/lib/types";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

async function ExploreResults({
  searchParams,
}: {
  searchParams: ExplorePageProps["searchParams"];
}) {
  const params = await searchParams;
  const sort = (["newest", "most_viewed", "most_liked"].includes(params.sort ?? "")
    ? params.sort
    : "newest") as SortOption;

  const projects = await getProjects({
    search: params.q,
    category: params.category,
    sort,
  });

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Try a different search or category, or be the first to add a project."
        action={<Button href="/projects/new">Add Project</Button>}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ba-text">Explore Projects</h1>
        <p className="mt-2 text-ba-text-muted">
          Discover SaaS, AI tools, MVPs, and proof-of-work from African builders.
        </p>
      </div>

      <form method="get" className="space-y-4 rounded-2xl border border-ba-border bg-ba-surface p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
              Search by name
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="e.g. InventoryPro"
              className="w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text placeholder:text-ba-text-muted focus:border-ba-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={params.category ?? "all"}
              className="w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text focus:border-ba-accent focus:outline-none"
            >
              <option value="all">All categories</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="mb-1.5 block text-xs font-medium text-ba-text-muted">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={params.sort ?? "newest"}
              className="w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text focus:border-ba-accent focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="most_viewed">Most viewed</option>
              <option value="most_liked">Most liked</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-ba-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-ba-accent-hover"
        >
          Apply filters
        </button>
      </form>

      <Suspense fallback={<PageLoader />} key={`${params.q}-${params.category}-${params.sort}`}>
        <ExploreResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
