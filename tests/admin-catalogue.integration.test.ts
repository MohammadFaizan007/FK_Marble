import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";
import { productInputSchema } from "../src/lib/admin-catalogue-schema";

const configured = isDatabaseConfigured();

test("a staff product with internal prices stays off the public catalogue", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { createAdminProduct, catalogueAccess } = await import("../src/services/admin-catalogue");
  const { getProductBySlug } = await import("../src/services/product-service");
  const prisma = getPrisma();
  const parsed = productInputSchema.parse({
    name: "Catalogue check",
    slug: `catalogue-check-${Date.now()}`,
    description: "A temporary staff record.",
    categoryId: "cat-tiles",
    material: "Ceramic",
    availability: "Confirm on enquiry",
    price: "100.00",
    wholesalePrice: "80.00",
    costPrice: "40.00",
    priceUnit: "SQ_FT",
    showPrice: true,
    isFeatured: false,
    isActive: false,
    isDemo: true,
  });
  const product = await createAdminProduct(prisma, parsed, catalogueAccess("OWNER"));

  try {
    assert.equal(product.costPrice?.toFixed(2), "40.00");
    assert.equal(product.wholesalePrice?.toFixed(2), "80.00");
    const publicResult = await getProductBySlug(product.slug);
    assert.equal(publicResult.ok, true);
    if (publicResult.ok) {
      assert.equal(publicResult.data, null);
    }
  } finally {
    await prisma.auditLog.deleteMany({ where: { entityId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });
  }
});
