import assert from "node:assert/strict";
import test from "node:test";
import { imageKind, isStoredCategoryImage, isStoredUpload } from "../src/lib/local-upload";

const png = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

test("category uploads accept a PNG signature and reject other files", () => {
  assert.equal(imageKind(png), "png");
  assert.equal(imageKind(Uint8Array.from([0xff, 0xd8, 0xff, 0x00])), "jpg");
  assert.equal(imageKind(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null);
});

test("only generated category and product files can be removed", () => {
  assert.equal(isStoredCategoryImage("/uploads/categories/11111111-1111-1111-1111-111111111111.png"), true);
  assert.equal(isStoredUpload("/uploads/products/11111111-1111-1111-1111-111111111111.jpg"), true);
  assert.equal(isStoredCategoryImage("/images/products/tiles-beige.png"), false);
  assert.equal(isStoredUpload("/uploads/products/../secret.png"), false);
});
