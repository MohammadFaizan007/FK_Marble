import { Gem, Headset, Layers, Store, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const reasons: readonly {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Premium Quality",
    description:
      "Surfaces chosen for finish, strength, and how they sit in a completed space.",
    icon: Gem,
  },
  {
    title: "Wide Product Range",
    description:
      "Tiles, marble, granite, Kota stone, sandstone, and other natural stone in one showroom.",
    icon: Layers,
  },
  {
    title: "Wholesale & Retail",
    description: "Supply for larger projects and for individual homes.",
    icon: Store,
  },
  {
    title: "Customer Support",
    description:
      "Speak with the showroom team by phone or WhatsApp during business hours.",
    icon: Headset,
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-t border-border bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="The showroom"
          title="Why choose FK Marble"
          description="A straightforward place to compare stone and surfaces for the work you have in mind."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <li
                key={reason.title}
                className="border border-border bg-background p-6 transition-colors duration-200 hover:border-accent"
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-border text-accent">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-2xl text-foreground">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {reason.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
