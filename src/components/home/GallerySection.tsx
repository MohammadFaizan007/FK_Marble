import { Gallery } from "@/components/common/Gallery";
import { SectionHeading } from "@/components/common/SectionHeading";
import { galleryImages } from "@/config/editorial";

export function GallerySection() {
  return (
    <section
      id="gallery"
      className="scroll-mt-16 bg-background py-20 sm:scroll-mt-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Spaces shaped by stone."
          description="Marble slabs, granite, floor tiles, stone textures, and showroom interiors. These photographs are references and are not FK Marble projects."
        />
        <Gallery images={galleryImages} className="mt-12" />
      </div>
    </section>
  );
}
