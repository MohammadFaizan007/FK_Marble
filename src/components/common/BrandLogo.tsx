import { cn } from "@/lib/utils";
import { logoArtwork } from "./logo-artwork";

const GOLD = "#B18A58";
const INK = "#24231F";
const PAPER = "#FFFFFF";

const logoWidths = {
  sm: 180,
  md: 260,
  lg: 340,
} as const;

export type BrandLogoVariant = "dark" | "light";
export type BrandLogoSize = keyof typeof logoWidths;

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  showTagline?: boolean;
  className?: string;
};

export function BrandLogo({
  variant = "dark",
  size = "md",
  showTagline = true,
  className,
}: BrandLogoProps) {
  const ink = variant === "light" ? PAPER : INK;
  const viewHeight = showTagline
    ? logoArtwork.fullHeight
    : logoArtwork.compactHeight;
  const label = showTagline
    ? "FK Marble, Stone & Surfaces"
    : "FK Marble";

  return (
    <svg
      viewBox={`0 0 ${logoArtwork.width} ${viewHeight}`}
      role="img"
      aria-label={label}
      style={{ width: logoWidths[size] }}
      className={cn("h-auto max-w-full", className)}
    >
      <title>{label}</title>
      {logoArtwork.shapes.map((shape) => {
        if (!showTagline && shape.group === "tagline") {
          return null;
        }

        const color = shape.role === "gold" ? GOLD : ink;
        const strokeWidth = "strokeWidth" in shape ? shape.strokeWidth : undefined;
        const opacity = "opacity" in shape ? shape.opacity : undefined;

        if (shape.kind === "stroke") {
          return (
            <path
              key={shape.id}
              d={shape.d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
          );
        }

        return (
          <path key={shape.id} d={shape.d} fill={color} opacity={opacity} />
        );
      })}
    </svg>
  );
}
