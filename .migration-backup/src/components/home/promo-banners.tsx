import Link from "next/link";
import { Calendar, Star } from "lucide-react";
import { getBuilderOfWeek, getLaunchFridaySettings } from "@/lib/admin-data";

export async function PromoBanners() {
  const [builder, launchFriday] = await Promise.all([
    getBuilderOfWeek(),
    getLaunchFridaySettings(),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-ba-border bg-gradient-to-br from-ba-accent/20 to-ba-surface p-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-ba-accent" />
          <h3 className="font-semibold text-ba-text">Builder of the Week</h3>
        </div>
        {builder ? (
          <>
            <p className="mt-3 font-medium text-ba-text">{builder.full_name}</p>
            <p className="text-sm text-ba-text-muted">@{builder.username}</p>
            <Link
              href={`/builders/${builder.username}`}
              className="mt-3 inline-block text-sm text-ba-accent hover:underline"
            >
              View profile →
            </Link>
          </>
        ) : (
          <p className="mt-2 text-sm text-ba-text-muted">
            An admin can select a builder in the admin portal.
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-ba-border bg-gradient-to-br from-ba-accent-blue/20 to-ba-surface p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-ba-accent-blue" />
          <h3 className="font-semibold text-ba-text">
            {launchFriday.enabled ? launchFriday.title : "Launch Friday"}
          </h3>
        </div>
        {launchFriday.enabled ? (
          <p className="mt-2 text-sm text-ba-text-muted">{launchFriday.message}</p>
        ) : (
          <p className="mt-2 text-sm text-ba-text-muted">
            Weekly launch spotlight — enable in admin featured settings.
          </p>
        )}
      </div>
    </div>
  );
}
