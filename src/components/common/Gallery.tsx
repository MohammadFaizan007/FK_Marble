import { MediaImage } from "@/components/common/MediaImage";
import type { GalleryImage } from "@/config/editorial";
import { cn } from "@/lib/utils";

type GalleryProps = {
  images: readonly GalleryImage[];
  className?: string;
};

export function Gallery({ images, className }: GalleryProps) {
  return (
    <ul className={cn("columns-1 gap-3 sm:columns-2 lg:columns-3", className)}>
      {images.map((image) => (
        <li key={image.src} className="mb-3 break-inside-avoid">
          <div
            className={cn(
              "relative overflow-hidden bg-muted",
              image.orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]",
            )}
          >
            <MediaImage
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
