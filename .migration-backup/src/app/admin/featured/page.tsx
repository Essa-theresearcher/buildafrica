import { FeaturedManager } from "@/components/admin/featured-manager";
import {
  getAdminBuilders,
  getApprovedProjectsForFeatured,
  getLaunchFridaySettings,
} from "@/lib/admin-data";

export default async function AdminFeaturedPage() {
  const [projects, builders, launchFriday] = await Promise.all([
    getApprovedProjectsForFeatured(),
    getAdminBuilders(),
    getLaunchFridaySettings(),
  ]);

  const builderOfWeekId =
    builders.find((b) => b.is_builder_of_week)?.id ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ba-text">Featured Content</h1>
        <p className="mt-1 text-sm text-ba-text-muted">
          Builder of the Week, featured projects, Launch Friday
        </p>
      </div>
      <FeaturedManager
        projects={projects}
        builders={builders}
        launchFriday={launchFriday}
        builderOfWeekId={builderOfWeekId}
      />
    </div>
  );
}
