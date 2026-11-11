import { siteConfig } from "../src/config/site";
import { sampleProducts } from "../src/config/products";
import {
  catalogueTermHi,
  categoryCopyHi,
  productDescriptionHi,
  productNameHi,
} from "../src/i18n/copy";
import { getPrisma } from "../src/lib/prisma";
import type { PriceUnit } from "../src/generated/prisma/client";

/**
 * Idempotent seed. Product rows copied from the Step 4 samples are marked
 * isDemo and are excluded from the public catalogue.
 */

const categories = siteConfig.categories.map((category, index) => {
  const slug = category.slug === "other-natural-stone" ? "natural-stone" : category.slug;
  const hindi = categoryCopyHi[slug];

  return {
    id: category.slug === "other-natural-stone" ? "cat-natural-stone" : `cat-${category.slug}`,
    name: category.name,
    nameHi: hindi?.name ?? null,
    slug,
    description: category.description,
    descriptionHi: hindi?.description ?? null,
    image: category.image,
    displayOrder: index + 1,
  };
});

function priceUnit(value?: string): PriceUnit | null {
  if (value === "sq-ft") {
    return "SQ_FT";
  }

  if (value === "piece") {
    return "PIECE";
  }

  if (value === "slab") {
    return "SLAB";
  }

  return null;
}

async function main() {
  const prisma = getPrisma();

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
      select: { image: true },
    });
    const image = existing?.image.startsWith("/uploads/categories/") ? existing.image : category.image;

    await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        ...category,
        isActive: true,
      },
      update: {
        name: category.name,
        nameHi: category.nameHi,
        description: category.description,
        descriptionHi: category.descriptionHi,
        image,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    });
  }

  await prisma.businessSettings.upsert({
    where: { id: "fk-marble" },
    create: {
      id: "fk-marble",
      businessName: "FK Marble",
      tagline: "STONE & SURFACES",
      phone: "9045760027",
      whatsappNumber: "9045760027",
      address: "177, ITI Chauraha",
      city: "Etawah",
      state: "Uttar Pradesh",
      openingTime: "09:00 AM",
      closingTime: "08:00 PM",
      businessDescription: siteConfig.description,
    },
    update: {
      businessName: "FK Marble",
      tagline: "STONE & SURFACES",
      phone: "9045760027",
      whatsappNumber: "9045760027",
      address: "177, ITI Chauraha",
      city: "Etawah",
      state: "Uttar Pradesh",
      openingTime: "09:00 AM",
      closingTime: "08:00 PM",
      businessDescription: siteConfig.description,
    },
  });

  for (const product of sampleProducts) {
    const unit = priceUnit(product.priceUnit);
    const hindi = {
      nameHi: productNameHi(product.slug),
      descriptionHi: productDescriptionHi(product.slug),
      materialHi: catalogueTermHi(product.material),
      finishHi: catalogueTermHi(product.finish),
      colorHi: catalogueTermHi(product.color),
      usageHi: catalogueTermHi(product.usage),
      availabilityHi: catalogueTermHi(product.availability),
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        id: product.id,
        name: product.name,
        nameHi: hindi.nameHi,
        slug: product.slug,
        description: product.description,
        descriptionHi: hindi.descriptionHi,
        categoryId: product.categoryId,
        material: product.material,
        materialHi: hindi.materialHi,
        size: product.size,
        thickness: product.thickness,
        finish: product.finish,
        finishHi: hindi.finishHi,
        color: product.color,
        colorHi: hindi.colorHi,
        usage: product.usage,
        usageHi: hindi.usageHi,
        price: product.showPrice && product.price ? product.price.toString() : null,
        priceUnit: unit,
        showPrice: product.showPrice,
        availability: product.availability,
        availabilityHi: hindi.availabilityHi,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        isDemo: true,
        createdAt: new Date(product.createdAt),
      },
      update: {
        name: product.name,
        nameHi: hindi.nameHi,
        description: product.description,
        descriptionHi: hindi.descriptionHi,
        categoryId: product.categoryId,
        material: product.material,
        materialHi: hindi.materialHi,
        size: product.size,
        thickness: product.thickness,
        finish: product.finish,
        finishHi: hindi.finishHi,
        color: product.color,
        colorHi: hindi.colorHi,
        usage: product.usage,
        usageHi: hindi.usageHi,
        price: product.showPrice && product.price ? product.price.toString() : null,
        priceUnit: unit,
        showPrice: product.showPrice,
        availability: product.availability,
        availabilityHi: hindi.availabilityHi,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        isDemo: true,
      },
    });

    for (const image of product.images) {
      await prisma.productImage.upsert({
        where: { id: image.id },
        create: {
          id: image.id,
          productId: product.id,
          imageUrl: image.url,
          altText: image.alt,
          isPrimary: image.isPrimary,
          displayOrder: image.displayOrder,
        },
        update: {
          productId: product.id,
          imageUrl: image.url,
          altText: image.alt,
          isPrimary: image.isPrimary,
          displayOrder: image.displayOrder,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await getPrisma().$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    await getPrisma().$disconnect().catch(() => undefined);
    process.exit(1);
  });
