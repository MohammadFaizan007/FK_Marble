import assert from "node:assert/strict";
import test from "node:test";
import { customerInputSchema } from "../src/lib/customer-schema";

test("a customer phone and GSTIN are stored without spaces", () => {
  const parsed = customerInputSchema.parse({
    name: "Etawah Builder",
    type: "BUILDER",
    phone: "+91 90457 60027",
    gstin: "09 AAAAA 0000 A1Z5",
    isActive: true,
  });

  assert.equal(parsed.phone, "9045760027");
  assert.equal(parsed.gstin, "09AAAAA0000A1Z5");
  assert.equal(parsed.type, "BUILDER");
});

test("a customer needs a known type", () => {
  const parsed = customerInputSchema.safeParse({
    name: "Walk in",
    type: "GUEST",
    isActive: true,
  });

  assert.equal(parsed.success, false);

  const badPhone = customerInputSchema.safeParse({
    name: "Walk in",
    type: "RETAIL",
    phone: "1234567890",
    isActive: true,
  });

  assert.equal(badPhone.success, false);
});
