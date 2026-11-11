import { MediaImage } from "@/components/common/MediaImage";
import { SectionHeading } from "@/components/common/SectionHeading";
import { editorialImages } from "@/config/editorial";
import { siteConfig } from "@/config/site";

const facts = [
  { label: "Showroom", value: siteConfig.name },
  {
    label: "Location",
    value: `${siteConfig.address.city}, ${siteConfig.address.state}`,
  },
  { label: "Service", value: "Wholesale and retail" },
  {
    label: "Selection",
    value: "Tiles, marble, granite, Kota stone, sandstone, and other natural stone",
  },
] as const;

export function AboutSection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <SectionHeading
            eyebrow="About FK Marble"
            title="Bringing Natural Elegance Into Every Space."
            description="At FK Marble, we bring together the beauty of natural stone and the elegance of modern surfaces. Explore our collection of tiles, marble, granite, Kota stone and sandstone for residential and commercial spaces."
          />
          <dl className="mt-8 divide-y divide-border border-y border-border">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  {fact.label}
                </dt>
                <dd className="text-sm leading-6 text-foreground sm:max-w-xs sm:text-right">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-3">
            <div className="relative col-span-3 aspect-[3/4] overflow-hidden bg-muted">
              <MediaImage
                src={editorialImages.aboutInterior.src}
                alt={editorialImages.aboutInterior.alt}
                fill
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="relative col-span-2 aspect-[3/4] self-end overflow-hidden bg-muted">
              <MediaImage
                src={editorialImages.aboutStone.src}
                alt={editorialImages.aboutStone.alt}
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Reference photographs for the page layout. These are not FK Marble
            projects.
          </p>
        </div>
      </div>
    </section>
  );
}
