import { BuildersTable } from "@/components/admin/builders-table";
import { getAdminBuilders } from "@/lib/admin-data";

export default async function AdminBuildersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const builders = await getAdminBuilders(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ba-text">Manage Builders</h1>
        <p className="mt-1 text-sm text-ba-text-muted">
          Roles, suspension, and project links
        </p>
      </div>
      <BuildersTable builders={builders} initialSearch={q} />
    </div>
  );
}
