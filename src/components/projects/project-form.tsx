"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createProject } from "@/lib/actions";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";

const inputClass =
  "w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text placeholder:text-ba-text-muted focus:border-ba-accent focus:outline-none";

export function ProjectForm({ userEmail }: { userEmail: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to upload screenshots.");
      setUploading(false);
      return;
    }

    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 5)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    setScreenshots((prev) => [...prev, ...urls].slice(0, 5));
    setUploading(false);
    e.target.value = "";
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const techRaw = (formData.get("tech_stack") as string) || "";
    const tech_stack = techRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const category = formData.get("category") as ProjectCategory;

    startTransition(async () => {
      const result = await createProject({
        title: formData.get("title") as string,
        short_description: formData.get("short_description") as string,
        problem_solved: formData.get("problem_solved") as string,
        category,
        tech_stack,
        demo_url: (formData.get("demo_url") as string) || "",
        github_url: (formData.get("github_url") as string) || "",
        contact_email: (formData.get("contact_email") as string) || userEmail,
        whatsapp: (formData.get("whatsapp") as string) || "",
        screenshots,
      });

      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Project name *
          </label>
          <input name="title" required className={inputClass} placeholder="My SaaS App" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Short description *
          </label>
          <textarea
            name="short_description"
            required
            rows={2}
            className={inputClass}
            placeholder="One-line pitch"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Problem solved *
          </label>
          <textarea
            name="problem_solved"
            required
            rows={4}
            className={inputClass}
            placeholder="What pain does this solve?"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Category *
          </label>
          <select name="category" required className={inputClass} defaultValue="SaaS">
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Tech stack (comma-separated)
          </label>
          <input
            name="tech_stack"
            className={inputClass}
            placeholder="Next.js, Supabase, Tailwind"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Demo link
          </label>
          <input name="demo_url" type="url" className={inputClass} placeholder="https://" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            GitHub link (optional)
          </label>
          <input name="github_url" type="url" className={inputClass} placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Contact email *
          </label>
          <input
            name="contact_email"
            type="email"
            required
            defaultValue={userEmail}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            WhatsApp (optional)
          </label>
          <input name="whatsapp" className={inputClass} placeholder="+252..." />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
            Screenshots (max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleScreenshotUpload}
            disabled={uploading || screenshots.length >= 5}
            className="text-sm text-ba-text-muted"
          />
          {uploading && (
            <p className="mt-2 flex items-center gap-2 text-sm text-ba-text-muted">
              <LoadingSpinner className="!h-4 !w-4" /> Uploading…
            </p>
          )}
          {screenshots.length > 0 && (
            <p className="mt-2 text-xs text-ba-text-muted">
              {screenshots.length} image(s) ready
            </p>
          )}
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Launch Project"}
      </Button>
    </form>
  );
}
