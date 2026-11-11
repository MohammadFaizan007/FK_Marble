type CatalogueNoticeProps = {
  title: string;
  message: string;
};

export function CatalogueNotice({ title, message }: CatalogueNoticeProps) {
  return (
    <div role="status" className="rounded-lg border border-border bg-surface px-6 py-14 text-center">
      <h2 className="font-heading text-3xl text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{message}</p>
    </div>
  );
}
