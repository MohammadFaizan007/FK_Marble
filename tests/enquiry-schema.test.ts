import assert from "node:assert/strict";
import test from "node:test";
import { enquirySchema, enquirySchemaFor, normalizeIndianMobile } from "../src/lib/enquiry-schema";

const valid = {
  customerName: "Aman",
  phone: "+91 90457 60027",
  email: null,
  productId: "prod-beige-floor-tile",
  productName: "Sample Tile Surface",
  enquiryType: "WHOLESALE",
  quantity: 100,
  quantityUnit: "SQ_FT",
  message: "Please share quotation",
};

test("normalizes Indian mobile numbers", () => {
  assert.equal(normalizeIndianMobile("+91 90457 60027"), "9045760027");
  assert.equal(normalizeIndianMobile("09045760027"), "9045760027");
  assert.equal(normalizeIndianMobile("1234567890"), null);
  assert.equal(normalizeIndianMobile("904576002"), null);
});

test("accepts a wholesale enquiry", () => {
  const parsed = enquirySchema.parse(valid);
  assert.equal(parsed.phone, "9045760027");
  assert.equal(parsed.enquiryType, "WHOLESALE");
  assert.equal(parsed.quantity, 100);
});

test("accepts a retail enquiry and an empty email", () => {
  const parsed = enquirySchema.parse({ ...valid, enquiryType: "RETAIL", email: "" });
  assert.equal(parsed.enquiryType, "RETAIL");
  assert.equal(parsed.email, null);
});

test("Hindi validation messages stay on the same schema", () => {
  const result = enquirySchemaFor("hi").safeParse({ ...valid, phone: "12345" });

  assert.equal(result.success, false);
  if (!result.success) {
    const phone = result.error.issues.find((issue) => issue.path.join(".") === "phone");
    assert.equal(phone?.message, "सही भारतीय मोबाइल नंबर लिखें।");
  }
});

test("rejects an invalid phone, quantity, and enquiry type", () => {
  const result = enquirySchema.safeParse({
    ...valid,
    phone: "12345",
    quantity: 0,
    enquiryType: "BULK",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join("."));
    assert.ok(fields.includes("phone"));
    assert.ok(fields.includes("quantity"));
    assert.ok(fields.includes("enquiryType"));
  }
});
