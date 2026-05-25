"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  adminDeleteProject,
  adminToggleFeatured,
  adminUpdateProjectCategory,
  adminUpdateProjectStatus,
} from "@/lib/admin-actions";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import { PROJECT_CATEGORIES, type ProjectWithBuilder } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function ProjectsTable({ projects }: { projects: ProjectWithBuilder[] }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function run(action: () => Promise<{ error?: string; success?: boolean }>, okMsg: string) {
    startTransition(async () => {
      const res = await action();
      if (res?.error) toast(res.error, "error");
      else toast(okMsg);
    });
  }

  if (projects.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ba-border py-12 text-center text-ba-text-muted">
        No projects yet.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-ba-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-ba-border bg-ba-surface-elevated text-ba-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Builder</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">Stats</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ba-border">
            {projects.map((p) => (
              <tr key={p.id} className="bg-ba-surface hover:bg-ba-surface-elevated/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ba-text">{p.title}</p>
                  <p className="text-xs text-ba-text-muted">{formatDate(p.created_at)}</p>
                </td>
                <td className="px-4 py-3 text-ba-text-muted">
                  {p.profiles?.full_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-xs font-medium",
                      p.status === "approved" && "bg-emerald-500/20 text-emerald-300",
                      p.status === "pending" && "bg-amber-500/20 text-amber-300",
                      p.status === "rejected" && "bg-rose-500/20 text-rose-300"
                    )}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.category}
                    disabled={pending}
                    onChange={(e) =>
                      run(
                        () =>
                          adminUpdateProjectCategory(
                            p.id,
                            e.target.value as (typeof PROJECT_CATEGORIES)[number]
                          ),
                        "Category updated"
                      )
                    }
                    className="rounded-lg border border-ba-border bg-ba-bg px-2 py-1 text-xs text-ba-text"
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pending || p.status !== "approved"}
                    onClick={() =>
                      run(
                        () => adminToggleFeatured(p.id, !p.is_featured),
                        p.is_featured ? "Unfeatured" : "Featured"
                      )
                    }
                    className={cn(
                      "text-xs font-medium",
                      p.is_featured ? "text-ba-accent" : "text-ba-text-muted"
                    )}
                  >
                    {p.is_featured ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-ba-text-muted">
                  {p.views} views · {p.likes} likes
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () => adminUpdateProjectStatus(p.id, "approved"),
                              "Project approved"
                            )
                          }
                          className="rounded-lg bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setRejectId(p.id)}
                          className="rounded-lg bg-rose-600/20 px-2 py-1 text-xs text-rose-300"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.status === "approved" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => adminUpdateProjectStatus(p.id, "pending"),
                            "Moved to pending"
                          )
                        }
                        className="rounded-lg border border-ba-border px-2 py-1 text-xs"
                      >
                        Unapprove
                      </button>
                    )}
                    <Link
                      href={`/projects/${p.slug}`}
                      className="rounded-lg border border-ba-border px-2 py-1 text-xs text-ba-accent"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDeleteId(p.id)}
                      className="rounded-lg bg-rose-600/20 px-2 py-1 text-xs text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete project?"
        description="This cannot be undone. Likes and activity linked to this project may be affected."
        confirmLabel="Delete"
        danger
        loading={pending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          run(
            async () => {
              const r = await adminDeleteProject(deleteId);
              setDeleteId(null);
              return r;
            },
            "Project deleted"
          );
        }}
      />

      <ConfirmModal
        open={!!rejectId}
        title="Reject project?"
        description="The builder will not appear publicly until resubmitted."
        confirmLabel="Reject"
        danger
        loading={pending}
        onCancel={() => {
          setRejectId(null);
          setRejectReason("");
        }}
        onConfirm={() => {
          if (!rejectId) return;
          run(
            async () => {
              const r = await adminUpdateProjectStatus(
                rejectId,
                "rejected",
                rejectReason || undefined
              );
              setRejectId(null);
              setRejectReason("");
              return r;
            },
            "Project rejected"
          );
        }}
      />
      {rejectId && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRejectId(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-ba-border bg-ba-surface p-4">
            <label className="text-sm text-ba-text-muted">Rejection reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 w-full rounded-xl border border-ba-border bg-ba-bg p-3 text-sm text-ba-text"
              rows={3}
            />
          </div>
        </div>
      )}
    </>
  );
}
