import assert from "node:assert/strict";
import test from "node:test";
import { getCollectionCards } from "../src/config/categories";
import { localizedCopy, productDescriptionHi, productNameHi } from "../src/i18n/copy";
import { toPublicProduct, toUiCategory, toUiProduct, type StoredCategory, type StoredProduct } from "../src/services/catalogue-mapper";

const category: StoredCategory = {
  id: "cat-tiles",
  name: "Tiles",
  nameHi: "टाइल्स",
  slug: "tiles",
  description: "Floor and wall tiles for indoor and outdoor use.",
  descriptionHi: "इनडोर और आउटडोर उपयोग के लिए फर्श और दीवार की टाइलें।",
  image: "/images/products/tiles-beige.png",
  displayOrder: 1,
  _count: { products: 0 },
};

const product: StoredProduct = {
  id: "prod-sample-tile",
  name: "Sample Tile Surface",
  nameHi: "नमूना टाइल सतह",
  slug: "sample-tile-surface",
  description: "Development sample.",
  descriptionHi: "डेवलपमेंट नमूना।",
  material: "Ceramic",
  materialHi: "सिरेमिक",
  size: "600 × 600 mm",
  thickness: "9 mm",
  finish: "Matte",
  finishHi: "मैट",
  color: "Beige",
  colorHi: "बेज",
  usage: "Indoor floors",
  usageHi: "इनडोर फर्श",
  price: null,
  priceUnit: null,
  showPrice: false,
  availability: "Confirm on enquiry",
  availabilityHi: "पूछताछ पर पुष्टि करें",
  isFeatured: false,
  isDemo: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  category,
  images: [],
};

test("Hindi catalogue copy falls back to the stored English text", () => {
  assert.equal(localizedCopy("en", "Tiles", "टाइल्स"), "Tiles");
  assert.equal(localizedCopy("hi", "Tiles", "टाइल्स"), "टाइल्स");
  assert.equal(localizedCopy("hi", "Tiles", "  "), "Tiles");
});

test("category cards keep one entry and switch the stored heading", () => {
  const english = getCollectionCards("en");
  const hindi = getCollectionCards("hi");

  assert.equal(english.length, hindi.length);
  assert.deepEqual(
    english.map((card) => card.slug),
    hindi.map((card) => card.slug),
  );
  assert.equal(english[0]?.name, "Premium Tiles");
  assert.equal(hindi[0]?.name, "प्रीमियम टाइल्स");
  assert.equal(hindi[0]?.href, "/categories/tiles");
});

test("the same product row supplies both languages", () => {
  const english = toUiProduct(product, "en");
  const hindi = toUiProduct(product, "hi");
  const published = toPublicProduct(product);

  assert.equal(english.id, product.id);
  assert.equal(hindi.id, product.id);
  assert.equal(english.slug, hindi.slug);
  assert.equal(english.name, "Sample Tile Surface");
  assert.equal(hindi.name, "नमूना टाइल सतह");
  assert.equal(hindi.material, "सिरेमिक");
  assert.equal(hindi.size, "600 × 600 mm");
  assert.equal(published.name, "Sample Tile Surface");
  assert.equal(published.nameHi, "नमूना टाइल सतह");
  assert.equal(toUiCategory(category, "hi").name, "टाइल्स");
  assert.equal(toUiCategory({ ...category, image: "/uploads/categories/11111111-1111-1111-1111-111111111111.jpg" }, "en").image, "/uploads/categories/11111111-1111-1111-1111-111111111111.jpg");
  assert.equal(productNameHi("sample-tile-surface"), "नमूना टाइल सतह");
  assert.match(productDescriptionHi("sample-tile-surface") ?? "", /स्टॉक नहीं/);
});
