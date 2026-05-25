"use client";

import { useState, useTransition } from "react";
import {
  adminSaveLaunchFriday,
  adminSetBuilderOfWeek,
  adminToggleFeatured,
} from "@/lib/admin-actions";
import { useToast } from "@/components/admin/toast-provider";
import type { LaunchFridaySettings, Profile, ProjectWithBuilder } from "@/lib/types";

export function FeaturedManager({
  projects,
  builders,
  launchFriday,
  builderOfWeekId,
}: {
  projects: ProjectWithBuilder[];
  builders: Profile[];
  launchFriday: LaunchFridaySettings;
  builderOfWeekId: string | null;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [lf, setLf] = useState(launchFriday);
  const [botw, setBotw] = useState(builderOfWeekId ?? "");

  const featured = projects.filter((p) => p.is_featured);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-ba-border bg-ba-surface p-6">
        <h2 className="text-lg font-semibold text-ba-text">Builder of the Week</h2>
        <p className="mt-1 text-sm text-ba-text-muted">
          Shown on the home page promo card.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={botw}
            onChange={(e) => setBotw(e.target.value)}
            className="min-w-[240px] rounded-xl border border-ba-border bg-ba-bg px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {builders
              .filter((b) => b.is_active)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name} (@{b.username})
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await adminSetBuilderOfWeek(botw || null);
                if (r?.error) toast(r.error, "error");
                else toast("Builder of the Week updated");
              })
            }
            className="rounded-xl bg-ba-accent px-4 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-ba-border bg-ba-surface p-6">
        <h2 className="text-lg font-semibold text-ba-text">Featured Projects</h2>
        <p className="mt-1 text-sm text-ba-text-muted">
          Only approved projects can be featured.
        </p>
        {featured.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-ba-text">
            {featured.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-ba-bg px-3 py-2">
                {p.title}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const r = await adminToggleFeatured(p.id, false);
                      if (r?.error) toast(r.error, "error");
                      else toast("Removed from featured");
                    })
                  }
                  className="text-xs text-rose-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <label className="text-xs text-ba-text-muted">Add featured project</label>
          <select
            className="mt-1 w-full rounded-xl border border-ba-border bg-ba-bg px-3 py-2 text-sm"
            defaultValue=""
            disabled={pending}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              e.target.value = "";
              startTransition(async () => {
                const r = await adminToggleFeatured(id, true);
                if (r?.error) toast(r.error, "error");
                else toast("Project featured");
              });
            }}
          >
            <option value="">Select approved project…</option>
            {projects
              .filter((p) => !p.is_featured)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-ba-border bg-ba-surface p-6">
        <h2 className="text-lg font-semibold text-ba-text">Launch Friday Banner</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lf.enabled}
              onChange={(e) => setLf({ ...lf, enabled: e.target.checked })}
            />
            Show banner on homepage
          </label>
          <input
            value={lf.title}
            onChange={(e) => setLf({ ...lf, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-xl border border-ba-border bg-ba-bg px-3 py-2 text-sm"
          />
          <textarea
            value={lf.message}
            onChange={(e) => setLf({ ...lf, message: e.target.value })}
            placeholder="Message"
            rows={3}
            className="w-full rounded-xl border border-ba-border bg-ba-bg px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await adminSaveLaunchFriday(lf);
                if (r?.error) toast(r.error, "error");
                else toast("Launch Friday banner saved");
              })
            }
            className="rounded-xl bg-ba-accent px-4 py-2 text-sm font-medium text-white"
          >
            Save banner
          </button>
        </div>
      </section>
    </div>
  );
}
