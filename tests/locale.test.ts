import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { localeCookieName, preferredLocalePath, stripLocale, withLocale } from "../src/i18n/locale";
import { proxy } from "../src/proxy";

test("locale helpers prefix public paths and leave the unprefixed site unchanged", () => {
  assert.equal(stripLocale("/hi/products"), "/products");
  assert.equal(stripLocale("/en"), "/");
  assert.equal(stripLocale("/products"), "/products");
  assert.equal(withLocale(null, "/products"), "/products");
  assert.equal(withLocale("hi", "/"), "/hi");
  assert.equal(withLocale("hi", "/#contact"), "/hi#contact");
  assert.equal(withLocale("en", "/categories/tiles"), "/en/categories/tiles");
  assert.equal(withLocale("hi", "/hi/products"), "/hi/products");
});

test("a localized path stores the language without a page script", () => {
  const response = proxy(new NextRequest("http://localhost:3000/hi/products"));
  assert.equal(response.cookies.get(localeCookieName)?.value, "hi");
  assert.equal(response.headers.get("location"), null);

  const redirected = proxy(
    new NextRequest("http://localhost:3000/products", {
      headers: { cookie: `${localeCookieName}=en` },
    }),
  );
  assert.equal(redirected.headers.get("location"), "http://localhost:3000/en/products");
});

test("a saved language redirects only unprefixed public pages", () => {
  assert.equal(preferredLocalePath("/", "hi"), "/hi");
  assert.equal(preferredLocalePath("/products", "en"), "/en/products");
  assert.equal(preferredLocalePath("/hi/products", "en"), null);
  assert.equal(preferredLocalePath("/products", undefined), null);
  assert.equal(preferredLocalePath("/api/products", "hi"), null);
  assert.equal(preferredLocalePath("/admin/login", "hi"), null);
  assert.equal(preferredLocalePath("/admin", "en"), null);
});
