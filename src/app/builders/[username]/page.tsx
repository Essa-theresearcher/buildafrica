import Image from "next/image";
import { notFound } from "next/navigation";
import { Github, Globe, Linkedin, MapPin, MessageCircle, Trophy, Twitter } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PlaceholderBadge } from "@/components/ui/badge";
import { getProfileByUsername, getProjectsByUserId } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

interface BuilderPageProps {
  params: Promise<{ username: string }>;
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  website: Globe,
};

export default async function BuilderProfilePage({ params }: BuilderPageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const projects = await getProjectsByUserId(profile.id);
  const social = (profile.social_links ?? {}) as Record<string, string>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 rounded-2xl border border-ba-border bg-ba-surface p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-ba-surface-elevated">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-ba-accent">
              {profile.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ba-text sm:text-3xl">{profile.full_name}</h1>
            <PlaceholderBadge>V1 placeholder</PlaceholderBadge>
          </div>
          <p className="text-ba-text-muted">@{profile.username}</p>
          {profile.location && (
            <p className="mt-2 flex items-center gap-1 text-sm text-ba-text-muted">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </p>
          )}
          {profile.bio && (
            <p className="mt-4 max-w-2xl leading-relaxed text-ba-text-muted">{profile.bio}</p>
          )}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-ba-surface-elevated px-3 py-1 text-xs text-ba-text"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(social).map(([key, url]) => {
              const Icon = socialIcons[key] ?? Globe;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-ba-border px-3 py-1.5 text-xs text-ba-text-muted hover:border-ba-accent hover:text-ba-text"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {key}
                </a>
              );
            })}
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-ba-border px-3 py-1.5 text-xs text-ba-text-muted hover:border-ba-accent hover:text-ba-text"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-ba-border bg-ba-surface-elevated px-6 py-4 text-center sm:min-w-[140px]">
          <Trophy className="mx-auto h-6 w-6 text-ba-accent" />
          <p className="mt-2 text-2xl font-bold text-ba-text">
            {formatNumber(profile.build_score)}
          </p>
          <p className="text-xs uppercase tracking-wide text-ba-text-muted">Build Score</p>
          <p className="mt-2 text-[10px] text-ba-text-muted">Algorithm coming in V2</p>
        </div>
      </div>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-ba-text">
          Projects by {profile.full_name}
        </h2>
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={{
                  ...p,
                  profiles: profile,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No projects yet" description="This builder hasn't launched anything." />
        )}
      </section>
    </div>
  );
}
