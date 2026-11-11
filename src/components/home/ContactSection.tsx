"use client";

import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { useChrome } from "@/i18n/use-chrome";
import { SectionHeading } from "@/components/common/SectionHeading";
import { WhatsAppButton, whatsAppHref } from "@/components/common/WhatsAppButton";
import { siteConfig } from "@/config/site";

const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.address.formatted)}`;

export function ContactSection() {
  const { copy } = useChrome();

  return (
    <section
      id="contact"
      className="scroll-mt-16 border-t border-border bg-surface py-20 sm:scroll-mt-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Let's Create Something Beautiful."
          description="Visit the showroom in Etawah, or send a message during business hours. Wholesale and retail enquiries are both welcome."
        />
        <div className="card">
          <p className="font-heading text-3xl text-foreground">{siteConfig.name}</p>
          <ul className="mt-6 space-y-5 text-sm leading-6">
            <li className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
              <address className="not-italic text-foreground">
                {siteConfig.address.line1},
                <br />
                {siteConfig.address.city}, {siteConfig.address.state},{" "}
                {siteConfig.address.country}.
              </address>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <a
                  href={siteConfig.contact.phoneHref}
                  className="text-foreground underline-offset-4 hover:text-accent hover:underline"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
                <p className="text-muted-foreground">{copy.phone}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <a
                  href={whatsAppHref("general")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-4 hover:text-accent hover:underline"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
                <p className="text-muted-foreground">WhatsApp</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
              <p className="text-foreground">
                {siteConfig.hours.display}
                <br />
                <span className="text-muted-foreground">{siteConfig.hours.days}.</span>
              </p>
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={siteConfig.contact.phoneHref} className="btn btn-primary w-full sm:w-auto">
              {copy.buttons.callNow}
            </a>
            <WhatsAppButton className="w-full sm:w-auto" />
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full sm:w-auto"
            >
              {copy.buttons.directions}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
