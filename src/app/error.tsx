"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold text-ba-text">Something went wrong</h2>
      <p className="mt-2 text-sm text-ba-text-muted">{error.message}</p>
      <Button variant="primary" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
