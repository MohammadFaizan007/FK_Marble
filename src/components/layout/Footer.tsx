import { BrandLogo } from "@/components/common/BrandLogo";
import { whatsAppHref } from "@/lib/whatsapp";
import { FooterCollections } from "@/components/layout/FooterCollections";
import { FooterExplore, FooterHeading, FooterIntro, FooterRights } from "@/components/layout/FooterChrome";
import { siteConfig } from "@/config/site";

async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await copyrightYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="max-w-xs">
          <BrandLogo variant="light" size="sm" />
          <p className="mt-5 text-xs font-medium tracking-[0.22em] text-accent uppercase">
            {siteConfig.tagline}
          </p>
          <FooterIntro />
        </div>

        <FooterExplore />

        <div>
          <FooterHeading name="collections" />
          <FooterCollections />
        </div>

        <div>
          <FooterHeading name="showroom" />
          <address className="mt-4 space-y-3 text-sm leading-6 text-primary-foreground/80 not-italic">
            <p>{siteConfig.name}</p>
            <p>{siteConfig.address.formatted}</p>
            <p>
              <a
                href={siteConfig.contact.phoneHref}
                className="transition-colors hover:text-accent"
              >
                {siteConfig.contact.phoneDisplay}
              </a>
            </p>
            <p>
              <a
                href={whatsAppHref("general")}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                WhatsApp {siteConfig.contact.phoneDisplay}
              </a>
            </p>
            <p>
              {siteConfig.hours.display}
              <br />
              {siteConfig.hours.days}
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs tracking-wide text-primary-foreground/60 sm:px-6 lg:px-8">
          © {year} {siteConfig.name}. <FooterRights />
        </p>
      </div>
    </footer>
  );
}
