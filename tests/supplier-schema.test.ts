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
    gstin: "09AAAAA0000A1Z5",
    notes: "",
    isActive: true,
  });

  assert.equal(parsed.phone, "919045760027");
  assert.equal(parsed.email, null);
  assert.equal(parsed.gstin, "09AAAAA0000A1Z5");

  const invalid = supplierInputSchema.safeParse({
    name: "Etawah Stone Yard",
    gstin: "not-a-gstin",
    isActive: true,
  });

  assert.equal(invalid.success, false);
});
