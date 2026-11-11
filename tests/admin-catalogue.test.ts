import assert from "node:assert/strict";
import test from "node:test";
import { productInputSchema } from "../src/lib/admin-catalogue-schema";
import { toPublicProduct } from "../src/services/catalogue-mapper";
import { catalogueAccess, toAdminProduct } from "../src/services/admin-catalogue";

const stored = {
  id: "product-1",
  name: "Sample",
  nameHi: null,
  slug: "sample",
  description: "A sample surface.",
  descriptionHi: null,
  categoryId: "cat-tiles",
  material: "Ceramic",
  materialHi: null,
  size: null,
  thickness: null,
  finish: null,
  finishHi: null,
  color: null,
  colorHi: null,
  usage: null,
  usageHi: null,
  availability: "Confirm on enquiry",
  availabilityHi: null,
  price: { toFixed: () => "100.00", toString: () => "100" },
  wholesalePrice: { toFixed: () => "80.00", toString: () => "80" },
  costPrice: { toFixed: () => "40.00", toString: () => "40" },
  priceUnit: "SQ_FT" as const,
  showPrice: true,
  isFeatured: false,
  isActive: true,
  isDemo: true,
  createdAt: new Date("2026-11-10T00:00:00.000Z"),
  updatedAt: new Date("2026-11-10T00:00:00.000Z"),
  category: {
    id: "cat-tiles",
    name: "Tiles",
    nameHi: null,
    slug: "tiles",
    description: "Tiles",
    descriptionHi: null,
    image: "/images/tiles.jpg",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date("2026-11-10T00:00:00.000Z"),
    updatedAt: new Date("2026-11-10T00:00:00.000Z"),
  },
  images: [],
};

test("the public product view leaves out cost and wholesale prices", () => {
  const view = toPublicProduct(stored);
  assert.equal(view.price, "100");
  assert.equal("costPrice" in view, false);
  assert.equal("wholesalePrice" in view, false);
});

test("staff price fields follow the role", () => {
  const sales = toAdminProduct(stored, catalogueAccess("SALES"));
  assert.equal(sales.price, "100.00");
  assert.equal(sales.wholesalePrice, "80.00");
  assert.equal("costPrice" in sales, false);

  const inventory = toAdminProduct(stored, catalogueAccess("INVENTORY"));
  assert.equal("price" in inventory, false);
  assert.equal("costPrice" in inventory, false);

  const owner = toAdminProduct(stored, catalogueAccess("OWNER"));
  assert.equal(owner.costPrice, "40.00");
});

test("a product price must use at most two decimal places", () => {
  const valid = productInputSchema.safeParse({
    name: "Checked surface",
    slug: "checked-surface",
    description: "A development record.",
    categoryId: "cat-tiles",
    material: "Ceramic",
    availability: "Confirm on enquiry",
    price: "100.50",
    wholesalePrice: "",
    costPrice: "",
    priceUnit: "",
    showPrice: false,
    isFeatured: false,
    isActive: false,
    isDemo: true,
  });
  assert.equal(valid.success, true);

  const invalid = productInputSchema.safeParse({
    name: "Checked surface",
    slug: "checked-surface",
    description: "A development record.",
    categoryId: "cat-tiles",
    material: "Ceramic",
    availability: "Confirm on enquiry",
    price: "100.555",
    wholesalePrice: "",
    costPrice: "",
    priceUnit: "",
    showPrice: false,
    isFeatured: false,
    isActive: false,
    isDemo: true,
  });
  assert.equal(invalid.success, false);
});
