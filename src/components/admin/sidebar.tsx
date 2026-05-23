"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  FolderKanban,
  Users,
  Star,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/builders", label: "Builders", icon: Users },
  { href: "/admin/featured", label: "Featured", icon: Star },
  { href: "/admin/activity", label: "Activity", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-ba-border bg-ba-surface">
      <div className="border-b border-ba-border px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-ba-text-muted">
          BuildAfrica
        </p>
        <p className="font-semibold text-ba-text">Admin Portal</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ba-accent/20 text-ba-accent"
                  : "text-ba-text-muted hover:bg-ba-surface-elevated hover:text-ba-text"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ba-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ba-text-muted hover:text-ba-text"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
      </div>
    </aside>
  );
}
