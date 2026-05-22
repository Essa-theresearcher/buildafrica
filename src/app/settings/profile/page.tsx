import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/builders/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/settings/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ba-text">Edit profile</h1>
        <p className="mt-2 text-ba-text-muted">
          Update how other builders see you on BuildAfrica.
        </p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-ba-surface p-6 sm:p-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
