import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { PageLoader } from "@/components/ui/loading";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ba-text">Join as Builder</h1>
        <p className="mt-2 text-sm text-ba-text-muted">
          Create an account to showcase your work on BuildAfrica
        </p>
      </div>
      <div className="rounded-2xl border border-ba-border bg-ba-surface p-6 sm:p-8">
        <Suspense fallback={<PageLoader />}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
