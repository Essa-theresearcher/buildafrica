import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  Eye,
  Github,
  Heart,
  Mail,
  MessageCircle,
} from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/projects/like-button";
import { ViewTracker } from "@/components/projects/view-tracker";
import { getProjectBySlug, userLikedProject } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNumber } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === project.user_id;
  const liked = await userLikedProject(user?.id, project.id);
  const isApproved = project.status === "approved";

  const builder = project.profiles;
  const contactHref = project.whatsapp
    ? `https://wa.me/${project.whatsapp.replace(/\D/g, "")}`
    : `mailto:${project.contact_email}`;

  return (
    <article className="space-y-10">
      {isApproved && <ViewTracker slug={slug} />}

      {(submitted === "pending" || project.status === "pending") && isOwner && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          Your project is pending admin approval. It will appear publicly once approved.
        </div>
      )}
      {project.status === "rejected" && isOwner && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
          This project was rejected
          {project.rejection_reason ? `: ${project.rejection_reason}` : "."}
        </div>
      )}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={project.category} />
          <span className="text-sm text-ba-text-muted">
            Launched {formatDate(project.created_at)}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-ba-text sm:text-4xl">{project.title}</h1>
        {builder && (
          <p className="text-ba-text-muted">
            by{" "}
            <Link
              href={`/builders/${builder.username}`}
              className="font-medium text-ba-accent hover:underline"
            >
              {builder.full_name}
            </Link>
          </p>
        )}
        <p className="max-w-2xl text-lg text-ba-text-muted">{project.short_description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ba-text-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {formatNumber(project.views)} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {formatNumber(project.likes)} likes
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {isApproved && (
            <LikeButton
              projectId={project.id}
              slug={slug}
              likes={project.likes}
              initialLiked={liked}
            />
          )}
          <Button href={contactHref} variant="primary">
            {project.whatsapp ? (
              <>
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Contact Builder
              </>
            )}
          </Button>
          {project.demo_url && (
            <Button href={project.demo_url} variant="outline">
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </Button>
          )}
          {project.github_url && (
            <Button href={project.github_url} variant="secondary">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          )}
        </div>
      </header>

      {project.screenshots && project.screenshots.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-ba-text">Screenshots</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.screenshots.map((url, i) => (
              <div
                key={url}
                className="relative aspect-video overflow-hidden rounded-2xl border border-ba-border bg-ba-surface-elevated"
              >
                <Image
                  src={url}
                  alt={`${project.title} screenshot ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-ba-border bg-ba-surface p-6">
        <h2 className="text-xl font-semibold text-ba-text">Problem solved</h2>
        <p className="mt-3 leading-relaxed text-ba-text-muted">{project.problem_solved}</p>
      </section>

      {project.tech_stack && project.tech_stack.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-ba-text">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-ba-border bg-ba-surface-elevated px-3 py-1 text-sm text-ba-text"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
