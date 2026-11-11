import { SectionHeading } from "@/components/common/SectionHeading";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";

export function BusinessTypeSection() {
  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tone="inverse"
          eyebrow="Wholesale and retail"
          title="Solutions for Every Project."
        />
        <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2">
          <article className="bg-primary px-0 py-8 md:py-10 md:pr-12">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
              Wholesale
            </p>
            <p className="mt-4 max-w-md text-base leading-7 text-primary-foreground/80">
              For bulk requirements and larger projects, contact our team to
              discuss your product requirements and quotation.
            </p>
            <WhatsAppButton intent="wholesale" className="mt-8 w-full sm:w-auto" />
          </article>
          <article className="bg-primary px-0 py-8 md:py-10 md:pl-12">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
              Retail
            </p>
            <p className="mt-4 max-w-md text-base leading-7 text-primary-foreground/80">
              Explore our collection and find the right materials for your home
              and personal projects.
            </p>
            <WhatsAppButton
              intent="retail"
              appearance="inverse"
              className="mt-8 w-full sm:w-auto"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
