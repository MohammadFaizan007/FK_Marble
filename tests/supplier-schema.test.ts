import assert from "node:assert/strict";
import test from "node:test";
import { supplierInputSchema } from "../src/lib/supplier-schema";

test("a supplier record accepts contact details and rejects an invalid GSTIN", () => {
  const parsed = supplierInputSchema.parse({
    name: "Etawah Stone Yard",
    contactName: "",
    phone: "+91 90457 60027",
    email: "",
    address: "177, ITI Chauraha",
    gstin: "09 AAAAA 0000 A1Z5",
    notes: "",
    isActive: true,
  });

  assert.equal(parsed.phone, "9045760027");
  assert.equal(parsed.email, null);
  assert.equal(parsed.gstin, "09AAAAA0000A1Z5");

  const invalid = supplierInputSchema.safeParse({
    name: "Etawah Stone Yard",
    gstin: "not-a-gstin",
    isActive: true,
  });

  assert.equal(invalid.success, false);

  const badPhone = supplierInputSchema.safeParse({
    name: "Etawah Stone Yard",
    phone: "12345",
    isActive: true,
  });

  assert.equal(badPhone.success, false);
  if (!badPhone.success) {
    assert.equal(badPhone.error.issues[0]?.message, "Enter a valid Indian mobile number.");
  }
});
