import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";
import { randomUUID } from "node:crypto";
import { categoryInputSchema, productInputSchema } from "../src/lib/admin-catalogue-schema";

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

test("a product on a purchase order stays on file", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { createAdminProduct, catalogueAccess, deleteAdminProduct, ProductInUseError } = await import("../src/services/admin-catalogue");
  const prisma = getPrisma();
  const parsed = productInputSchema.parse({
    name: "Delete check stone",
    slug: `delete-check-${Date.now()}`,
    description: "A temporary staff record.",
    categoryId: "cat-tiles",
    material: "Ceramic",
    availability: "Confirm on enquiry",
    price: "100.00",
    wholesalePrice: "80.00",
    costPrice: "40.00",
    priceUnit: "SQ_FT",
    showPrice: false,
    isFeatured: false,
    isActive: false,
    isDemo: true,
  });
  const product = await createAdminProduct(prisma, parsed, catalogueAccess("OWNER"));
  const supplier = await prisma.supplier.create({
    data: { id: randomUUID(), name: "Delete check supplier", isActive: true },
  });
  const orderId = randomUUID();

  try {
    const removed = await deleteAdminProduct(prisma, product.id);
    assert.equal(removed?.id, product.id);
    assert.equal(await prisma.product.count({ where: { id: product.id } }), 0);

    const kept = await createAdminProduct(prisma, { ...parsed, slug: `delete-kept-${Date.now()}` }, catalogueAccess("OWNER"));
    await prisma.purchaseOrder.create({
      data: {
        id: orderId,
        number: `PO-${orderId.slice(0, 8).toUpperCase()}`,
        supplierId: supplier.id,
        items: { create: { id: randomUUID(), productId: kept.id, quantity: "1.00" } },
      },
    });

    await assert.rejects(() => deleteAdminProduct(prisma, kept.id), ProductInUseError);
    assert.equal(await prisma.product.count({ where: { id: kept.id } }), 1);
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: orderId } });
    await prisma.purchaseOrder.delete({ where: { id: orderId } });
    await prisma.product.delete({ where: { id: kept.id } });
  } finally {
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: orderId } });
    await prisma.purchaseOrder.deleteMany({ where: { id: orderId } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: "delete-check-" } } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: "delete-kept-" } } });
    await prisma.supplier.deleteMany({ where: { id: supplier.id } });
  }
});

test("a category with products stays on file", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { catalogueAccess, createAdminCategory, createAdminProduct, deleteAdminCategory, CategoryInUseError } = await import("../src/services/admin-catalogue");
  const prisma = getPrisma();
  const stamp = Date.now();
  const category = await createAdminCategory(
    prisma,
    categoryInputSchema.parse({
      name: "Delete check category",
      slug: `delete-check-category-${stamp}`,
      description: "A temporary staff record.",
      image: "/images/categories/delete-check.png",
      displayOrder: 90,
      isActive: false,
    }),
  );
  const product = await createAdminProduct(
    prisma,
    productInputSchema.parse({
      name: "Delete check category stone",
      slug: `delete-check-category-stone-${stamp}`,
      description: "A temporary staff record.",
      categoryId: category.id,
      material: "Ceramic",
      availability: "Confirm on enquiry",
      showPrice: false,
      isFeatured: false,
      isActive: false,
      isDemo: true,
    }),
    catalogueAccess("OWNER"),
  );

  try {
    await assert.rejects(() => deleteAdminCategory(prisma, category.id), CategoryInUseError);
    assert.equal(await prisma.category.count({ where: { id: category.id } }), 1);
    await prisma.product.delete({ where: { id: product.id } });
    const removed = await deleteAdminCategory(prisma, category.id);
    assert.equal(removed?.id, category.id);
    assert.equal(await prisma.category.count({ where: { id: category.id } }), 0);
  } finally {
    await prisma.product.deleteMany({ where: { id: product.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
  }
});
