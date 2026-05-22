import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { PromoBanners } from "@/components/home/promo-banners";
import { ActivityFeed } from "@/components/home/activity-feed";
import { ProjectCard } from "@/components/projects/project-card";
import { BuilderCard } from "@/components/builders/builder-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  getFeaturedProjects,
  getTrendingBuilders,
  getRecentActivity,
} from "@/lib/data";

export default async function HomePage() {
  const [featured, builders, activity] = await Promise.all([
    getFeaturedProjects(),
    getTrendingBuilders(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-16">
      <Hero />
      <PromoBanners />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ba-text">Featured Projects</h2>
            <p className="mt-1 text-sm text-ba-text-muted">
              Hand-picked launches from African builders
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-sm text-ba-accent hover:text-ba-accent-hover"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured projects yet"
            description="Connect Supabase and run the seed script to load demo data."
            action={<Button href="/explore">Explore Projects</Button>}
          />
        )}
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-ba-text">Trending Builders</h2>
          <p className="mt-1 mb-6 text-sm text-ba-text-muted">
            Builders ranked by Build Score
          </p>
          {builders.length > 0 ? (
            <div className="space-y-3">
              {builders.map((b, i) => (
                <BuilderCard key={b.id} builder={b} rank={i + 1} />
              ))}
            </div>
          ) : (
            <EmptyState title="No builders yet" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ba-text">Recent Launches</h2>
          <p className="mt-1 mb-6 text-sm text-ba-text-muted">
            Live activity from the community
          </p>
          <ActivityFeed items={activity} />
        </div>
      </section>
    </div>
  );
}
