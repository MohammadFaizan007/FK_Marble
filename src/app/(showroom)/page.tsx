import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { AboutSection } from "@/components/home/AboutSection";
import { BusinessTypeSection } from "@/components/home/BusinessTypeSection";
import { CategorySection } from "@/components/home/CategorySection";
import { ContactSection } from "@/components/home/ContactSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { GallerySection } from "@/components/home/GallerySection";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { chromeFor } from "@/i18n/chrome";
import { isLocale } from "@/i18n/locale";
import { publicMetadata } from "@/i18n/metadata";

type HomePageProps = {
  params?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const lang = params ? (await params).lang : undefined;
  const copy = chromeFor(isLocale(lang) ? lang : "en");

  return publicMetadata({
    lang,
    path: "/",
    title: copy.homeTitle,
    description: copy.homeDescription,
    absoluteTitle: true,
  });
}

export default function HomePage({ params }: HomePageProps) {
  return (
    <main id="main" className="flex-1">
      <HeroSection />
      <div id="collections" className="scroll-mt-16 sm:scroll-mt-20">
        <Suspense
          fallback={
            <section className="bg-background py-20 sm:py-28">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <LoadingState label="Loading collections" />
              </div>
            </section>
          }
        >
          <CategorySection params={params} />
        </Suspense>
        <Suspense
          fallback={
            <section className="border-t border-border bg-surface py-20 sm:py-28">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <LoadingState label="Loading featured products" />
              </div>
            </section>
          }
        >
          <FeaturedProducts params={params} />
        </Suspense>
      </div>
      <div id="about" className="scroll-mt-16 sm:scroll-mt-20">
        <AboutSection />
        <WhyChooseUs />
      </div>
      <BusinessTypeSection />
      <GallerySection />
      <ContactSection />
    </main>
  );
}
