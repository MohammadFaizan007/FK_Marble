import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "../src/app/sitemap";
import { chromeFor } from "../src/i18n/chrome";
import { publicMetadata } from "../src/i18n/metadata";

test("navigation and validation copy switch with the route language", () => {
  assert.equal(chromeFor("en").nav.home, "Home");
  assert.equal(chromeFor("hi").nav.home, "होम");
  assert.equal(chromeFor("hi").buttons.exploreCollection, "संग्रह देखें");
  assert.equal(chromeFor("en").validation.phone, "Enter a valid Indian mobile number.");
  assert.equal(chromeFor("hi").buttons.home, chromeFor("hi").nav.home);
});

test("public metadata advertises English and Hindi urls", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://fkmarble.example";
  const metadata = publicMetadata({
    lang: "hi",
    path: "/products",
    title: "हमारे संग्रह देखें",
    description: "संग्रह",
  });

  assert.equal(metadata.alternates?.canonical, "/hi/products");
  assert.equal(metadata.alternates?.languages?.en, "https://fkmarble.example/en/products");
  assert.equal(metadata.alternates?.languages?.hi, "https://fkmarble.example/hi/products");
  assert.equal(metadata.alternates?.languages?.["x-default"], "https://fkmarble.example/products");

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("the sitemap lists both languages and no demo products", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://fkmarble.example";
  const entries = sitemap();

  assert.equal(entries.some((entry) => entry.url === "https://fkmarble.example/hi"), true);
  assert.equal(entries.some((entry) => entry.url === "https://fkmarble.example/en/categories/tiles"), true);
  assert.equal(entries.some((entry) => entry.url.includes("/products/sample-")), false);
  assert.equal(entries[0]?.alternates?.languages?.hi, "https://fkmarble.example/hi");

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
