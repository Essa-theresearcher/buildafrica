import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { PageLoader } from "@/components/ui/loading";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ba-text">Welcome back</h1>
        <p className="mt-2 text-sm text-ba-text-muted">Log in to launch and manage projects</p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-ba-surface p-6 sm:p-8">
        <Suspense fallback={<PageLoader />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
