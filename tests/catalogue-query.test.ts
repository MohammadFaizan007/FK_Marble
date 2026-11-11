import assert from "node:assert/strict";
import test from "node:test";
import { parseProductListQuery, publicProductWhere } from "../src/lib/catalogue-query";

test("public product filters exclude demo and inactive records", () => {
  const where = publicProductWhere({
    materials: ["Ceramic", "Marble"],
    colors: ["Beige"],
    finishes: ["Matte"],
    sizes: ["600 × 600 mm"],
    search: "tile",
    categorySlug: "tiles",
  });

  assert.deepEqual(where.AND[0], { isActive: true });
  assert.deepEqual(where.AND[1], { isDemo: false });
  assert.deepEqual(where.AND[2], { category: { slug: "tiles", isActive: true } });
  assert.deepEqual(where.AND[3], { material: { in: ["Ceramic", "Marble"] } });
  assert.deepEqual(where.AND[4], { color: { in: ["Beige"] } });
  assert.deepEqual(where.AND[5], { finish: { in: ["Matte"] } });
  assert.deepEqual(where.AND[6], { size: { in: ["600 × 600 mm"] } });
  assert.ok(where.AND[7] && "OR" in where.AND[7]);
});

test("query parsing combines pagination, search, and sort", () => {
  const params = new URLSearchParams({
    page: "2",
    limit: "6",
    search: "kota",
    category: "other-natural-stone",
    material: "Sandstone, Kota Limestone",
    sortBy: "name",
    sortOrder: "asc",
  });
  const query = parseProductListQuery(params);

  assert.equal(query.page, 2);
  assert.equal(query.limit, 6);
  assert.equal(query.search, "kota");
  assert.equal(query.categorySlug, "natural-stone");
  assert.deepEqual(query.materials, ["Sandstone", "Kota Limestone"]);
  assert.equal(query.sortBy, "name");
  assert.equal(query.sortOrder, "asc");
});

test("invalid pagination is rejected", () => {
  assert.throws(() => parseProductListQuery(new URLSearchParams({ page: "0" })));
});
