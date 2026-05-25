import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-ba-text">Project not found</h1>
      <p className="mt-2 text-ba-text-muted">This project may have been removed.</p>
      <Button href="/explore" variant="primary" className="mt-6">
        Explore Projects
      </Button>
    </div>
  );
}
