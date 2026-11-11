import "../src/lib/load-env";
import assert from "node:assert/strict";
import test from "node:test";
import { isDatabaseConfigured } from "../src/lib/database";

const configured = isDatabaseConfigured();

test("a quotation revision keeps history and an issued invoice keeps its number", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { createCustomer, deleteCustomer } = await import("../src/services/admin-customers");
  const { customerInputSchema } = await import("../src/lib/customer-schema");
  const { quotationInputSchema } = await import("../src/lib/document-schema");
  const {
    DocumentStateError,
    cancelInvoice,
    convertQuotation,
    createInvoice,
    createQuotation,
    deleteQuotation,
    getInvoice,
    deleteInvoice,
    issueInvoice,
    quotationPdf,
    reviseQuotation,
    setQuotationStatus,
    updateQuotation,
  } = await import("../src/services/admin-documents");
  const prisma = getPrisma();
  const productId = `quote-check-${Date.now()}`;
  const customer = await createCustomer(
    prisma,
    customerInputSchema.parse({ name: "Quote check customer", type: "RETAIL", phone: "9045760027", isActive: true }),
  );
  let quoteId = "";
  let revisionId = "";
  let invoiceId = "";
  let salesOrderId = "";

  try {
    await prisma.product.create({
      data: {
        id: productId,
        name: "Quote check stone",
        slug: productId,
        description: "A temporary staff record.",
        categoryId: "cat-tiles",
        material: "Ceramic",
        availability: "Confirm on enquiry",
        isActive: true,
        isDemo: false,
        costPrice: "10.00",
        wholesalePrice: "20.00",
      },
    });
    const input = quotationInputSchema.parse({
      customerId: customer.id,
      items: [{ productId, quantity: "2", unit: "SQ_FT", rate: "150" }],
    });
    const quote = await createQuotation(prisma, input);
    quoteId = quote.id;
    assert.equal(quote.items[0]?.rate, "150.00");
    assert.equal(quote.total, "300.00");
    assert.equal("costPrice" in quote, false);
    assert.match(quote.number, /^QT-\d{5}$/);

    await updateQuotation(prisma, quote.id, { ...input, items: [{ productId, quantity: "2", unit: "SQ_FT", rate: "160" }] });
    const sent = await setQuotationStatus(prisma, quote.id, "SENT");
    assert.equal(sent.status, "SENT");
    await assert.rejects(() => updateQuotation(prisma, quote.id, input), DocumentStateError);

    const revision = await reviseQuotation(prisma, quote.id);
    revisionId = revision.id;
    assert.equal(revision.number, quote.number);
    assert.equal(revision.revision, 2);
    assert.equal(revision.status, "DRAFT");
    assert.equal(revision.items[0]?.rate, "160.00");

    const accepted = await setQuotationStatus(prisma, revision.id, "ACCEPTED");
    const converted = await convertQuotation(prisma, accepted.id);
    salesOrderId = converted.salesOrderId ?? "";
    assert.equal(converted.status, "CONVERTED");
    const order = await prisma.salesOrder.findUnique({ where: { id: salesOrderId }, include: { items: true } });
    assert.equal(order?.items[0]?.quantity.toFixed(2), "2.00");
    assert.equal("rate" in (order?.items[0] ?? {}), false);

    const invoice = await createInvoice(prisma, { customerId: customer.id, quotationId: revision.id, notes: null });
    invoiceId = invoice.id;
    assert.equal(invoice.number, null);
    assert.equal(invoice.total, "320.00");
    const issued = await issueInvoice(prisma, invoice.id);
    assert.match(issued.number ?? "", /^INV-\d{5}$/);
    await assert.rejects(() => issueInvoice(prisma, invoice.id), DocumentStateError);
    await assert.rejects(() => deleteInvoice(prisma, invoice.id), DocumentStateError);
    const cancelled = await cancelInvoice(prisma, invoice.id, "Customer changed the order.");
    assert.equal(cancelled.status, "CANCELLED");
    assert.equal(cancelled.number, issued.number);
    await assert.rejects(() => deleteInvoice(prisma, invoice.id), DocumentStateError);
    const kept = await getInvoice(prisma, invoice.id);
    assert.equal(kept?.number, issued.number);

    const pdf = await quotationPdf(prisma, quote.id);
    assert.equal(new TextDecoder().decode(pdf.body).includes("costPrice"), false);
    assert.equal(new TextDecoder().decode(pdf.body).startsWith("%PDF-1.4"), true);
  } finally {
    if (invoiceId) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
      await prisma.invoice.deleteMany({ where: { id: invoiceId } });
    }

    if (revisionId) {
      await prisma.quotation.updateMany({ where: { id: revisionId }, data: { salesOrderId: null } });
      await prisma.quotationItem.deleteMany({ where: { quotationId: revisionId } });
      await prisma.quotation.deleteMany({ where: { id: revisionId } });
    }

    if (quoteId) {
      await prisma.quotationItem.deleteMany({ where: { quotationId: quoteId } });
      await prisma.quotation.deleteMany({ where: { id: quoteId } });
    }

    if (salesOrderId) {
      await prisma.salesOrderItem.deleteMany({ where: { salesOrderId } });
      await prisma.salesOrder.deleteMany({ where: { id: salesOrderId } });
    }

    await prisma.product.deleteMany({ where: { id: productId } });
    await deleteCustomer(prisma, customer.id);
  }
});

test("a draft quotation can be removed and a sent quotation stays on file", { skip: configured ? false : "DATABASE_URL is not configured" }, async () => {
  const { getPrisma } = await import("../src/lib/prisma");
  const { createCustomer, deleteCustomer } = await import("../src/services/admin-customers");
  const { customerInputSchema } = await import("../src/lib/customer-schema");
  const { quotationInputSchema } = await import("../src/lib/document-schema");
  const { DocumentStateError, createQuotation, deleteQuotation, setQuotationStatus } = await import("../src/services/admin-documents");
  const prisma = getPrisma();
  const productId = `quote-delete-${Date.now()}`;
  const customer = await createCustomer(
    prisma,
    customerInputSchema.parse({ name: "Quote delete customer", type: "RETAIL", isActive: true }),
  );

  try {
    await prisma.product.create({
      data: {
        id: productId,
        name: "Quote delete stone",
        slug: productId,
        description: "A temporary staff record.",
        categoryId: "cat-tiles",
        material: "Ceramic",
        availability: "Confirm on enquiry",
        isActive: true,
        isDemo: false,
      },
    });
    const input = quotationInputSchema.parse({
      customerId: customer.id,
      items: [{ productId, quantity: "1", unit: "PIECES", rate: "50" }],
    });
    const removable = await createQuotation(prisma, input);
    await deleteQuotation(prisma, removable.id);
    const kept = await createQuotation(prisma, input);
    await setQuotationStatus(prisma, kept.id, "SENT");
    await assert.rejects(() => deleteQuotation(prisma, kept.id), DocumentStateError);
    await prisma.quotationItem.deleteMany({ where: { quotationId: kept.id } });
    await prisma.quotation.delete({ where: { id: kept.id } });
  } finally {
    await prisma.product.deleteMany({ where: { id: productId } });
    await deleteCustomer(prisma, customer.id);
  }
});
