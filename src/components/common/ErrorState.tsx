"use client";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "This page could not be loaded",
  description = "Try again. You can also reach the showroom on WhatsApp during business hours.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-border bg-surface px-6 py-14 text-center">
      <h1 className="font-heading text-4xl text-foreground">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <button type="button" className="btn btn-primary mt-6" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
