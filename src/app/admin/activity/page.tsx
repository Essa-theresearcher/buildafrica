import { ActivityTable } from "@/components/admin/activity-table";
import { getAdminActivity } from "@/lib/admin-data";

export default async function AdminActivityPage() {
  const items = await getAdminActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ba-text">Activity Moderation</h1>
        <p className="mt-1 text-sm text-ba-text-muted">
          Review and remove inappropriate feed items
        </p>
      </div>
      <ActivityTable items={items} />
    </div>
  );
}
