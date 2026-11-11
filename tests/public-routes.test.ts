import assert from "node:assert/strict";
import test from "node:test";
import { absoluteSiteUrl, publicCataloguePaths } from "../src/lib/public-routes";

test("public catalogue paths cover the homepage, products, and six categories", () => {
  const paths = publicCataloguePaths();

  assert.deepEqual(paths, [
    "/",
    "/products",
    "/categories/tiles",
    "/categories/marble",
    "/categories/granite",
    "/categories/kota-stone",
    "/categories/sandstone",
    "/categories/natural-stone",
  ]);
  assert.equal(paths.includes("/categories/other-natural-stone"), false);
  assert.equal(paths.some((path) => path.startsWith("/products/sample-")), false);
});

test("absolute site urls use the configured origin", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://fkmarble.example/";

  assert.equal(absoluteSiteUrl("/"), "https://fkmarble.example");
  assert.equal(absoluteSiteUrl("/products"), "https://fkmarble.example/products");

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
