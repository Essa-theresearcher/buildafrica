import { requireAdmin } from "@/lib/auth-admin";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminToastProvider } from "@/components/admin/toast-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AdminToastProvider>
      <div className="flex min-h-screen bg-ba-bg">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-ba-border bg-ba-surface px-6">
            <p className="text-sm text-ba-text-muted">
              Signed in as <span className="text-ba-text">{admin.full_name}</span>
            </p>
            <span className="rounded-lg bg-ba-accent/20 px-2 py-0.5 text-xs font-medium text-ba-accent">
              Admin
            </span>
          </header>
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </div>
      </div>
    </AdminToastProvider>
  );
}
