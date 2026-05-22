import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ba-border bg-ba-surface/50 px-8 py-16 text-center">
      <Inbox className="mb-4 h-10 w-10 text-ba-text-muted" />
      <h3 className="text-lg font-semibold text-ba-text">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-ba-text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
