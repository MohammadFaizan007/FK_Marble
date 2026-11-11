import assert from "node:assert/strict";
import test from "node:test";
import { quotationInputSchema } from "../src/lib/document-schema";
import { buildDocumentPdf } from "../src/lib/document-pdf";

test("a quotation stores a customer rate and rejects a repeated product", () => {
  const parsed = quotationInputSchema.parse({
    customerId: "cust-1",
    validUntil: "2026-12-01",
    notes: "",
    terms: "Rates stay firm until the validity date.",
    items: [{ productId: "prod-1", quantity: "2.50", unit: "SQ_FT", rate: "150.00" }],
  });

  assert.equal(parsed.items[0]?.rate, "150.00");
  assert.equal(parsed.notes, null);
  assert.equal(parsed.validUntil?.toISOString(), "2026-12-01T00:00:00.000Z");

  const duplicate = quotationInputSchema.safeParse({
    customerId: "cust-1",
    items: [
      { productId: "prod-1", quantity: "1", unit: "PIECES", rate: "10" },
      { productId: "prod-1", quantity: "2", unit: "PIECES", rate: "10" },
    ],
  });

  assert.equal(duplicate.success, false);
});

test("a document pdf starts as a pdf file", () => {
  const body = buildDocumentPdf({
    kind: "Quotation",
    number: "QT-00001 revision 1",
    status: "DRAFT",
    customer: "Aman",
    dateLabel: "11 Nov 2026",
    extra: [],
    lines: [{ name: "Sample stone", quantity: "2.00", unit: "Square feet", rate: "150.00", amount: "300.00" }],
    total: "300.00",
    notes: null,
    terms: null,
  });
  assert.equal(new TextDecoder().decode(body).startsWith("%PDF-1.4"), true);
});
