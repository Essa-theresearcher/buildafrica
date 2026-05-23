export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-ba-border bg-ba-surface p-5">
      <p className="text-sm text-ba-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ba-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-ba-accent">{hint}</p>}
    </div>
  );
}
