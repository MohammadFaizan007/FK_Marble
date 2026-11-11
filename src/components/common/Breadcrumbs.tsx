import { LocaleLink } from "@/components/common/LocaleLink";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  tone?: "default" | "inverse";
};

export function Breadcrumbs({ items, tone = "default" }: BreadcrumbsProps) {
  const inverse = tone === "inverse";

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
          inverse ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && !current ? (
                <LocaleLink href={item.href} className="underline-offset-4 hover:text-accent hover:underline">
                  {item.label}
                </LocaleLink>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={cn(current && (inverse ? "text-white" : "text-foreground"))}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
