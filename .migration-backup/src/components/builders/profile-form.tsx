"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-ba-border bg-ba-bg px-4 py-2.5 text-sm text-ba-text focus:border-ba-accent focus:outline-none";

export function ProfileForm({ profile }: { profile: Profile }) {
  const social = (profile.social_links ?? {}) as Record<string, string>;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const skillsRaw = (formData.get("skills") as string) || "";
    startTransition(async () => {
      const result = await updateProfile({
        full_name: formData.get("full_name") as string,
        bio: (formData.get("bio") as string) || "",
        location: (formData.get("location") as string) || "",
        skills: skillsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        whatsapp: (formData.get("whatsapp") as string) || "",
        twitter: (formData.get("twitter") as string) || "",
        github: (formData.get("github") as string) || "",
        linkedin: (formData.get("linkedin") as string) || "",
        website: (formData.get("website") as string) || "",
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">Full name</label>
        <input name="full_name" required defaultValue={profile.full_name} className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">Bio</label>
        <textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">Location</label>
        <input name="location" defaultValue={profile.location ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">
          Skills (comma-separated)
        </label>
        <input
          name="skills"
          defaultValue={(profile.skills ?? []).join(", ")}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">WhatsApp</label>
        <input name="whatsapp" defaultValue={profile.whatsapp ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">Twitter URL</label>
          <input name="twitter" type="url" defaultValue={social.twitter ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">GitHub URL</label>
          <input name="github" type="url" defaultValue={social.github ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">LinkedIn URL</label>
          <input name="linkedin" type="url" defaultValue={social.linkedin ?? ""} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ba-text-muted">Website</label>
          <input name="website" type="url" defaultValue={social.website ?? ""} className={inputClass} />
        </div>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
