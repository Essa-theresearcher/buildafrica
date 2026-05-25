import Image from "next/image";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { CategoryBadge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { ProjectWithBuilder } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectWithBuilder }) {
  const screenshot = project.screenshots?.[0];
  const builder = project.profiles;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ba-border bg-ba-surface transition-all hover:border-ba-accent/40 hover:shadow-lg hover:shadow-ba-accent/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ba-surface-elevated">
        {screenshot ? (
          <Image
            src={screenshot}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ba-text-muted">
            No preview
          </div>
        )}
        {project.is_featured && (
          <span className="absolute left-3 top-3 rounded-lg bg-ba-accent/90 px-2 py-0.5 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ba-text group-hover:text-ba-accent">
            {project.title}
          </h3>
          <CategoryBadge category={project.category} />
        </div>
        <p className="line-clamp-2 text-sm text-ba-text-muted">
          {project.short_description}
        </p>
        {builder && (
          <p className="text-xs text-ba-text-muted">
            by{" "}
            <span className="text-ba-text">{builder.full_name}</span>
          </p>
        )}
        <div className="mt-auto flex items-center gap-4 text-xs text-ba-text-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(project.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {formatNumber(project.likes)}
          </span>
        </div>
      </div>
    </Link>
  );
}
