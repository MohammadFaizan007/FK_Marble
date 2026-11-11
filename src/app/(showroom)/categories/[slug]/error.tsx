"use client";

import { ErrorState } from "@/components/common/ErrorState";

export default function CategoryError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
      <ErrorState onRetry={reset} />
    </main>
  );
}
