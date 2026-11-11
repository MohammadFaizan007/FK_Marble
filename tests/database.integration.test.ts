import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";

const configured = isDatabaseConfigured();
const skipReason = configured ? false : "DATABASE_URL is not configured";

test("database connection", { skip: skipReason }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const rows = await getPrisma().$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
  assert.equal(Number(rows[0]?.ok), 1);
});

test("category retrieval excludes nothing required for the six collections", { skip: skipReason }, async () => {
  const { getCategories } = await import("../src/services/product-service");
  const result = await getCategories();
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.data.length >= 6);
    const tiles = result.data.find((category) => category.slug === "tiles");
    assert.ok(tiles);
    assert.ok((tiles?.name.length ?? 0) >= 2);
    assert.equal(tiles?.image.startsWith("/"), true);
  }
});

test("product retrieval excludes demo and inactive products", { skip: skipReason }, async () => {
  const { getProducts, getProductBySlug } = await import("../src/services/product-service");
  const result = await getProducts({ limit: 48 });
  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.data.items.some((product) => product.slug === "hidden-sample-tile"), false);
  assert.equal(result.data.items.some((product) => product.slug === "sample-tile-surface"), false);
  const hidden = await getProductBySlug("hidden-sample-tile");
  const sample = await getProductBySlug("sample-tile-surface");
  assert.equal(hidden.ok && hidden.data, null);
  assert.equal(sample.ok && sample.data, null);

  const { getPrisma } = await import("../src/lib/prisma");
  const stored = await getPrisma().product.findUnique({
    where: { slug: "sample-tile-surface" },
    select: { name: true, nameHi: true, isDemo: true },
  });
  assert.equal(stored?.name, "Sample Tile Surface");
  assert.equal(stored?.nameHi, "नमूना टाइल सतह");
  assert.equal(stored?.isDemo, true);
});

test("product search, filters, and pagination", { skip: skipReason }, async () => {
  const { getProducts } = await import("../src/services/product-service");
  const result = await getProducts({
    search: "stone",
    materials: ["Natural Stone"],
    page: 1,
    limit: 1,
    sortBy: "name",
    sortOrder: "asc",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.data.meta.limit === 1);
    assert.ok(result.data.items.length <= 1);
  }
});

test("unknown product and category", { skip: skipReason }, async () => {
  const { getProductBySlug, getCategoryBySlug } = await import("../src/services/product-service");
  const product = await getProductBySlug("not-a-real-product");
  const category = await getCategoryBySlug("missing-stone");
  assert.equal(product.ok && product.data, null);
  assert.equal(category.ok && category.data, null);
});

test("enquiry creation", { skip: skipReason }, async () => {
  const { createEnquiry } = await import("../src/services/product-service");
  const { enquirySchema } = await import("../src/lib/enquiry-schema");
  const input = enquirySchema.parse({
    customerName: "Test Customer",
    phone: "9045760027",
    email: null,
    productId: null,
    productName: "Integration test",
    enquiryType: "RETAIL",
    quantity: 1,
    quantityUnit: "PIECES",
    message: "Automated integration test",
  });
  const result = await createEnquiry(input);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.status, "PENDING");
    assert.ok(result.data.id);
  }
});

test("business settings retrieval", { skip: skipReason }, async () => {
  const { getBusinessSettings } = await import("../src/services/product-service");
  const result = await getBusinessSettings();
  assert.equal(result.ok, true);
  if (result.ok && result.data) {
    assert.equal(result.data.businessName, "FK Marble");
    assert.equal(result.data.phone, "9045760027");
  }
});
