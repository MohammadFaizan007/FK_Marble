import assert from "node:assert/strict";
import test from "node:test";
import * as categories from "../src/app/api/categories/route";
import * as categoriesV1 from "../src/app/api/v1/categories/route";
import * as categorySlug from "../src/app/api/categories/[slug]/route";
import * as categorySlugV1 from "../src/app/api/v1/categories/[slug]/route";
import * as enquiries from "../src/app/api/enquiries/route";
import * as enquiriesV1 from "../src/app/api/v1/enquiries/route";
import * as products from "../src/app/api/products/route";
import * as productsV1 from "../src/app/api/v1/products/route";
import * as productSlug from "../src/app/api/products/[slug]/route";
import * as productSlugV1 from "../src/app/api/v1/products/[slug]/route";
import * as settings from "../src/app/api/settings/route";
import * as settingsV1 from "../src/app/api/v1/settings/route";

test("versioned catalogue routes use the same handlers", () => {
  assert.equal(categoriesV1.GET, categories.GET);
  assert.equal(categorySlugV1.GET, categorySlug.GET);
  assert.equal(productsV1.GET, products.GET);
  assert.equal(productSlugV1.GET, productSlug.GET);
  assert.equal(enquiriesV1.POST, enquiries.POST);
  assert.equal(settingsV1.GET, settings.GET);
});
