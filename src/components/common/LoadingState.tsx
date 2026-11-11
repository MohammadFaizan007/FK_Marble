type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading products" }: LoadingStateProps) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-border border-t-accent"
      />
      {label}
    </div>
  );
}
