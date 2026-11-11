import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  description,
  align = "left",
  tone = "default",
  className,
}: SectionHeadingProps) {
  const inverse = tone === "inverse";

  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col gap-3",
        align === "center"
          ? "mx-auto items-center text-center"
          : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading text-3xl sm:text-4xl",
          inverse ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-xl text-base leading-7",
            inverse ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
