import type { ProductCategorySlug } from "@/config/site";

export type EnquiryIntent = "wholesale" | "retail" | "general";

/** Fields collected from a customer before an enquiry is stored or sent. */
export type EnquiryInput = {
  name: string;
  phone: string;
  message: string;
  intent: EnquiryIntent;
  categorySlug?: ProductCategorySlug;
  productSlug?: string;
};
