import type { ReactNode } from "react";
import { SkipLink } from "@/components/common/SkipLink";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Footer, Header } from "@/components/layout";
import { localBusinessJsonLd } from "@/lib/structured-data";

export function ShowroomFrame({ children }: { children: ReactNode }) {
  const structuredData = JSON.stringify(localBusinessJsonLd());

  return (
    <>
      <SkipLink />
      <Header />
      {children}
      <Footer />
      <WhatsAppButton appearance="floating" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
    </>
  );
}
