"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useChrome } from "@/i18n/use-chrome";
import { whatsAppHref, type WhatsAppIntent } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export { whatsAppHref, type WhatsAppIntent };

const appearanceClass = {
  accent: "btn btn-accent",
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  inverse:
    "btn border border-white/40 bg-transparent text-white hover:border-accent hover:text-accent",
  floating:
    "fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm sm:right-6 sm:bottom-6",
} as const;

type WhatsAppButtonProps = {
  intent?: WhatsAppIntent;
  productName?: string;
  appearance?: keyof typeof appearanceClass;
  className?: string;
  children?: ReactNode;
};

export function WhatsAppButton({
  intent = "general",
  productName,
  appearance = "accent",
  className,
  children,
}: WhatsAppButtonProps) {
  const { copy } = useChrome();
  const floating = appearance === "floating";
  const visibleLabel = children ?? (intent === "general" ? copy.buttons.enquireWhatsApp : intent === "product" ? copy.buttons.whatsAppEnquiry : intent === "wholesale" ? copy.buttons.wholesaleEnquiry : copy.buttons.retailEnquiry);
  const accessibleLabel =
    intent === "product"
      ? `${copy.buttons.enquireProduct} ${productName ?? copy.products}`
      : intent === "wholesale"
        ? copy.buttons.wholesaleWhatsApp
        : intent === "retail"
          ? copy.buttons.retailWhatsApp
          : copy.buttons.enquireWhatsApp;

  return (
    <a
      href={whatsAppHref(intent, productName)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(appearanceClass[appearance], className)}
      aria-label={accessibleLabel}
    >
      <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
      {floating ? null : visibleLabel}
    </a>
  );
}
