import Link from "next/link";
import { Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/projects/new", label: "Add Project" },
];

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileUsername: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    profileUsername = data?.username ?? null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ba-border/80 bg-ba-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ba-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ba-accent to-ba-accent-blue">
            <Rocket className="h-5 w-5 text-white" />
          </span>
          <span>
            Build<span className="ba-gradient-text">Africa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ba-text-muted transition-colors hover:text-ba-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {profileUsername && (
                <Link
                  href={`/builders/${profileUsername}`}
                  className="hidden text-sm text-ba-text-muted hover:text-ba-text sm:block"
                >
                  Profile
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="!px-3 !py-2">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button href="/auth/login" variant="ghost" className="!px-3 !py-2">
                Login
              </Button>
              <Button href="/auth/signup" variant="primary" className="!px-4 !py-2">
                Join
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
