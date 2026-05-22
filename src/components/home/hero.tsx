import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="ba-grid-bg relative overflow-hidden rounded-3xl border border-ba-border bg-ba-surface/50 px-6 py-16 sm:px-12 sm:py-20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ba-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-ba-accent-blue/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ba-border bg-ba-surface-elevated px-4 py-1.5 text-xs text-ba-text-muted">
          <Sparkles className="h-3.5 w-3.5 text-ba-accent" />
          Showcase platform for African builders
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Ship publicly.{" "}
          <span className="ba-gradient-text">Get seen. Get opportunities.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-ba-text-muted sm:text-lg">
          A platform for African builders to showcase real products, SaaS apps,
          MVPs, and proof-of-work.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/explore" variant="primary">
            Explore Projects
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/auth/signup" variant="outline">
            Join as Builder
          </Button>
        </div>
      </div>
    </section>
  );
}
