/**
 * Server integrations live in this folder.
 * Authentication and media uploads are planned for later steps.
 */
export {
  createEnquiry,
  getBusinessSettings,
  getCategories,
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
  getProductsByCategory,
  getUiCategoryBySlug,
  getUiProductBySlug,
  listCategories,
  listFeaturedProducts,
  listProducts,
  listRelatedProducts,
  searchProducts,
} from "./product-service";

export const plannedIntegrations = ["auth", "media"] as const;

export type PlannedIntegration = (typeof plannedIntegrations)[number];
