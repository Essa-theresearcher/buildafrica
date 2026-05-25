"use client";

import { useState, useTransition } from "react";
import { adminDeleteActivity } from "@/lib/admin-actions";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import type { Activity } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

export function ActivityTable({ items }: { items: Activity[] }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ba-border py-12 text-center text-ba-text-muted">
        No activity records.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-ba-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ba-border bg-ba-surface-elevated text-ba-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ba-border">
            {items.map((a) => (
              <tr key={a.id} className="bg-ba-surface">
                <td className="px-4 py-3 text-ba-text">{a.message}</td>
                <td className="px-4 py-3 text-ba-text-muted">{a.type}</td>
                <td className="px-4 py-3 text-ba-text-muted">
                  {formatRelativeTime(a.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setDeleteId(a.id)}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Remove activity?"
        description="This removes the item from the public feed."
        confirmLabel="Remove"
        danger
        loading={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const r = await adminDeleteActivity(deleteId);
            if (r?.error) toast(r.error, "error");
            else toast("Activity removed");
            setDeleteId(null);
          });
        }}
      />
    </>
  );
}
