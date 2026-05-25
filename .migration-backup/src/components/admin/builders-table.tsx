"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminToggleUserActive, adminUpdateUserRole } from "@/lib/admin-actions";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import type { Profile } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function BuildersTable({
  builders,
  initialSearch,
}: {
  builders: Profile[];
  initialSearch?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch ?? "");
  const [suspendId, setSuspendId] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string; success?: boolean }>, okMsg: string) {
    startTransition(async () => {
      const res = await action();
      if (res?.error) toast(res.error, "error");
      else toast(okMsg);
    });
  }

  return (
    <>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/admin/builders?q=${encodeURIComponent(search)}`);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, username, email…"
          className="flex-1 rounded-xl border border-ba-border bg-ba-bg px-4 py-2 text-sm text-ba-text"
        />
        <button
          type="submit"
          className="rounded-xl bg-ba-accent px-4 py-2 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      {builders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ba-border py-12 text-center text-ba-text-muted">
          No builders found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ba-border">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-ba-border bg-ba-surface-elevated text-ba-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Builder</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ba-border">
              {builders.map((b) => (
                <tr key={b.id} className="bg-ba-surface">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ba-text">{b.full_name}</p>
                    <p className="text-xs text-ba-text-muted">@{b.username}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.role}
                      disabled={pending}
                      onChange={(e) =>
                        run(
                          () =>
                            adminUpdateUserRole(b.id, e.target.value as "user" | "admin"),
                          "Role updated"
                        )
                      }
                      className="rounded-lg border border-ba-border bg-ba-bg px-2 py-1 text-xs"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-xs",
                        b.is_active
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      )}
                    >
                      {b.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ba-text-muted">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/builders/${b.username}`}
                        className="rounded-lg border border-ba-border px-2 py-1 text-xs text-ba-accent"
                      >
                        Profile
                      </Link>
                      <Link
                        href={`/admin/projects?user=${b.id}`}
                        className="rounded-lg border border-ba-border px-2 py-1 text-xs"
                      >
                        Projects
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => (b.is_active ? setSuspendId(b.id) : run(
                          () => adminToggleUserActive(b.id, true),
                          "User activated"
                        ))}
                        className="rounded-lg bg-rose-600/20 px-2 py-1 text-xs text-rose-300"
                      >
                        {b.is_active ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!suspendId}
        title="Suspend user?"
        description="They cannot upload new projects while suspended."
        confirmLabel="Suspend"
        danger
        loading={pending}
        onCancel={() => setSuspendId(null)}
        onConfirm={() => {
          if (!suspendId) return;
          run(
            async () => {
              const r = await adminToggleUserActive(suspendId, false);
              setSuspendId(null);
              return r;
            },
            "User suspended"
          );
        }}
      />
    </>
  );
}
