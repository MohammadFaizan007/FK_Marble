import { siteConfig } from "@/config/site";
import type { ProductEnquiryDraft } from "@/types/product";

export type WhatsAppIntent = "general" | "product" | "wholesale" | "retail";

const generalMessage =
  "Hi FK Marble,\n\nI would like to enquire about your products.\n\nPlease share more details.";

function enquiryMessage(intent: WhatsAppIntent, productName?: string): string {
  if (intent === "product") {
    return `Hi FK Marble,\n\nI would like to enquire about ${productName ?? "a product"}.\n\nPlease share more details.`;
  }

  if (intent === "wholesale") {
    return "Hi FK Marble,\n\nEnquiry type: Wholesale\n\nI would like to enquire about bulk requirements for a project.\n\nPlease share more details.";
  }

  if (intent === "retail") {
    return "Hi FK Marble,\n\nEnquiry type: Retail\n\nI would like to enquire about materials for a home project.\n\nPlease share more details.";
  }

  return generalMessage;
}

export function whatsAppUrl(message: string): string {
  return `${siteConfig.contact.whatsappHref}?text=${encodeURIComponent(message)}`;
}

export function whatsAppHref(
  intent: WhatsAppIntent = "general",
  productName?: string,
): string {
  return whatsAppUrl(enquiryMessage(intent, productName));
}

export function productEnquiryMessage(draft: ProductEnquiryDraft): string {
  const nameLine = draft.name?.trim()
    ? `My name is ${draft.name.trim()}.\n\n`
    : "";
  const messageLine = draft.message?.trim() ? `\n\nMessage: ${draft.message.trim()}` : "";

  return `Hello FK Marble,\n\n${nameLine}I am interested in your product.\n\nProduct: ${draft.productName}\nCategory: ${draft.category}\nMaterial: ${draft.material?.trim() || "Not specified"}\nSize: ${draft.size?.trim() || "Not specified"}\nEnquiry Type: ${draft.enquiryType}\nQuantity: ${draft.quantity}\nUnit: ${draft.unit}\n\nPlease share the price, availability and further details.${messageLine}\n\nThank you.`;
}

export function productEnquiryHref(draft: ProductEnquiryDraft): string {
  return whatsAppUrl(productEnquiryMessage(draft));
}
