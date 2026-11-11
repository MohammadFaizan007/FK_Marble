import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient, type AdminRole, type InvoiceStatus, type QuotationStatus } from "@/generated/prisma/client";
import { documentUnitLabels, type DocumentLineInput, type InvoiceInput, type QuotationInput } from "@/lib/document-schema";
import { buildDocumentPdf } from "@/lib/document-pdf";
import { hasPermission } from "@/lib/permissions";
import { createSalesOrder, SalesOrderNotFoundError, SalesOrderStateError } from "@/services/admin-sales";

type Writer = PrismaClient | Prisma.TransactionClient;

const quoteInclude = {
  customer: { select: { id: true, name: true } },
  items: { orderBy: { productName: "asc" as const } },
  invoices: { select: { id: true, number: true, status: true }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.QuotationInclude;

const invoiceInclude = {
  customer: { select: { id: true, name: true } },
  quotation: { select: { id: true, number: true, revision: true } },
  items: { orderBy: { productName: "asc" as const } },
} satisfies Prisma.InvoiceInclude;

const quoteMoves: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: ["SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
};

const revisable: QuotationStatus[] = ["SENT", "ACCEPTED", "REJECTED", "EXPIRED"];

export class DocumentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentNotFoundError";
  }
}

export class DocumentStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentStateError";
  }
}

export function documentAccess(role: AdminRole) {
  const sales = hasPermission(role, "sales.create");
  const approve = hasPermission(role, "sales.approve");
  const issue = hasPermission(role, "invoice.issue");

  return {
    viewQuotes: sales || approve || issue,
    editQuotes: sales,
    viewInvoices: sales || approve || issue,
    draftInvoice: sales || issue,
    issueInvoice: issue,
  };
}

function money(value: Prisma.Decimal | string | number) {
  return new Prisma.Decimal(value).toDecimalPlaces(2).toFixed(2);
}

function lineAmount(quantity: Prisma.Decimal | string, rate: Prisma.Decimal | string) {
  return new Prisma.Decimal(quantity).mul(rate).toDecimalPlaces(2);
}

async function nextSequence(db: Writer, sequence: "quotation_number_seq" | "invoice_number_seq", prefix: "QT" | "INV") {
  const rows =
    sequence === "quotation_number_seq"
      ? await db.$queryRaw<Array<{ n: number | bigint | string }>>`SELECT nextval('quotation_number_seq')::int AS n`
      : await db.$queryRaw<Array<{ n: number | bigint | string }>>`SELECT nextval('invoice_number_seq')::int AS n`;
  const value = Number(rows[0]?.n);

  if (!Number.isInteger(value) || value < 1) {
    throw new DocumentStateError("The document number could not be assigned.");
  }

  return `${prefix}-${String(value).padStart(5, "0")}`;
}

async function pricedLines(db: Writer, items: DocumentLineInput[]) {
  const products = await db.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    select: { id: true, name: true, isActive: true, isDemo: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productById.get(item.productId);

    if (!product || !product.isActive || product.isDemo) {
      throw new DocumentStateError("Choose an active product that is not a demo sample.");
    }

    return {
      id: randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
    };
  });
}

function mapQuote(
  quote: Prisma.QuotationGetPayload<{ include: typeof quoteInclude }>,
) {
  const items = quote.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: money(item.quantity),
    unit: item.unit,
    rate: money(item.rate),
    amount: money(lineAmount(item.quantity, item.rate)),
  }));
  const total = items.reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0));

  return {
    id: quote.id,
    number: quote.number,
    revision: quote.revision,
    familyId: quote.familyId,
    status: quote.status,
    validUntil: quote.validUntil,
    notes: quote.notes,
    terms: quote.terms,
    customer: quote.customer,
    salesOrderId: quote.salesOrderId,
    invoices: quote.invoices,
    createdAt: quote.createdAt,
    items,
    total: money(total),
  };
}

function mapInvoice(invoice: Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>) {
  const items = invoice.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: money(item.quantity),
    unit: item.unit,
    rate: money(item.rate),
    amount: money(lineAmount(item.quantity, item.rate)),
  }));
  const total = items.reduce((sum, item) => sum.plus(item.amount), new Prisma.Decimal(0));

  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    notes: invoice.notes,
    cancelReason: invoice.cancelReason,
    issuedAt: invoice.issuedAt,
    customer: invoice.customer,
    quotation: invoice.quotation,
    salesOrderId: invoice.salesOrderId,
    createdAt: invoice.createdAt,
    items,
    total: money(total),
  };
}

async function activeCustomer(db: Writer, customerId: string) {
  const customer = await db.customer.findUnique({ where: { id: customerId }, select: { id: true, isActive: true } });

  if (!customer?.isActive) {
    throw new DocumentStateError("Choose an active customer.");
  }
}

export function listQuotations(db: PrismaClient) {
  return db.quotation.findMany({
    orderBy: [{ createdAt: "desc" }, { revision: "desc" }],
    include: { customer: { select: { name: true } }, items: { select: { quantity: true, rate: true } } },
  });
}

export function listInvoices(db: PrismaClient) {
  return db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } }, items: { select: { quantity: true, rate: true } } },
  });
}

export async function getQuotation(db: Writer, id: string) {
  const quote = await db.quotation.findUnique({ where: { id }, include: quoteInclude });
  return quote ? mapQuote(quote) : null;
}

export async function getInvoice(db: Writer, id: string) {
  const invoice = await db.invoice.findUnique({ where: { id }, include: invoiceInclude });
  return invoice ? mapInvoice(invoice) : null;
}

export async function createQuotation(db: Writer, input: QuotationInput) {
  await activeCustomer(db, input.customerId);
  const lines = await pricedLines(db, input.items);
  const id = randomUUID();
  const number = await nextSequence(db, "quotation_number_seq", "QT");

  await db.quotation.create({
    data: {
      id,
      number,
      revision: 1,
      familyId: id,
      customerId: input.customerId,
      validUntil: input.validUntil ?? null,
      notes: input.notes,
      terms: input.terms,
      items: { create: lines },
    },
  });

  const quote = await getQuotation(db, id);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return quote;
}

export async function updateQuotation(db: Writer, id: string, input: QuotationInput) {
  const current = await db.quotation.findUnique({ where: { id }, select: { id: true, status: true } });

  if (!current) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  if (current.status !== "DRAFT") {
    throw new DocumentStateError("A quotation that has left draft stays as it was sent.");
  }

  await activeCustomer(db, input.customerId);
  const lines = await pricedLines(db, input.items);

  await db.quotationItem.deleteMany({ where: { quotationId: id } });
  await db.quotation.update({
    where: { id },
    data: {
      customerId: input.customerId,
      validUntil: input.validUntil ?? null,
      notes: input.notes,
      terms: input.terms,
      items: { create: lines },
    },
  });

  const quote = await getQuotation(db, id);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return quote;
}

export async function setQuotationStatus(db: Writer, id: string, status: "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
  const current = await db.quotation.findUnique({ where: { id }, select: { status: true } });

  if (!current) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  if (!quoteMoves[current.status].includes(status)) {
    throw new DocumentStateError("This quotation cannot move to that status.");
  }

  await db.quotation.update({ where: { id }, data: { status } });
  const quote = await getQuotation(db, id);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return quote;
}

export async function reviseQuotation(db: Writer, id: string) {
  const current = await db.quotation.findUnique({ where: { id }, include: { items: true } });

  if (!current) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  if (!revisable.includes(current.status)) {
    throw new DocumentStateError("Revise a quotation after it has been sent.");
  }

  const openDraft = await db.quotation.findFirst({
    where: { familyId: current.familyId, status: "DRAFT" },
    select: { id: true },
  });

  if (openDraft) {
    throw new DocumentStateError("Finish the open revision before starting another.");
  }

  const latest = await db.quotation.aggregate({ where: { familyId: current.familyId }, _max: { revision: true } });
  const revision = (latest._max.revision ?? current.revision) + 1;
  const nextId = randomUUID();

  await db.quotation.create({
    data: {
      id: nextId,
      number: current.number,
      revision,
      familyId: current.familyId,
      customerId: current.customerId,
      validUntil: current.validUntil,
      notes: current.notes,
      terms: current.terms,
      items: {
        create: current.items.map((item) => ({
          id: randomUUID(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
        })),
      },
    },
  });

  const quote = await getQuotation(db, nextId);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return quote;
}

export async function convertQuotation(db: Writer, id: string) {
  const current = await db.quotation.findUnique({
    where: { id },
    include: { items: { select: { productId: true, quantity: true } } },
  });

  if (!current) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  if (current.status !== "ACCEPTED" || current.salesOrderId) {
    throw new DocumentStateError("Convert a quotation only after the customer has accepted it.");
  }

  let order: Awaited<ReturnType<typeof createSalesOrder>>;

  try {
    order = await createSalesOrder(db, {
      customerId: current.customerId,
      notes: `Converted from ${current.number} revision ${current.revision}.`,
      items: current.items.map((item) => ({ productId: item.productId, quantity: money(item.quantity) })),
    });
  } catch (error) {
    if (error instanceof SalesOrderStateError || error instanceof SalesOrderNotFoundError) {
      throw new DocumentStateError(error.message);
    }

    throw error;
  }

  await db.quotation.update({ where: { id }, data: { status: "CONVERTED", salesOrderId: order.id } });
  const quote = await getQuotation(db, id);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return quote;
}

export async function deleteQuotation(db: Writer, id: string) {
  const current = await db.quotation.findUnique({
    where: { id },
    select: { id: true, status: true, _count: { select: { invoices: true } } },
  });

  if (!current) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  if (current.status !== "DRAFT") {
    throw new DocumentStateError("A quotation that has left draft stays on file.");
  }

  if (current._count.invoices > 0) {
    throw new DocumentStateError("This quotation has an invoice, so the record stays on file.");
  }

  await db.quotation.delete({ where: { id } });
  return id;
}

async function createInvoiceRecord(
  db: Writer,
  input: {
    customerId: string;
    quotationId?: string | null;
    salesOrderId?: string | null;
    notes: string | null;
    items: DocumentLineInput[] | { productId: string; productName: string; quantity: Prisma.Decimal | string; unit: string; rate: Prisma.Decimal | string }[];
  },
) {
  await activeCustomer(db, input.customerId);
  const first = input.items[0];
  const lines =
    first && "productName" in first
      ? input.items.flatMap((item) =>
          "productName" in item
            ? [
                {
                  id: randomUUID(),
                  productId: item.productId,
                  productName: item.productName,
                  quantity: money(item.quantity),
                  unit: item.unit,
                  rate: money(item.rate),
                },
              ]
            : [],
        )
      : await pricedLines(db, input.items as DocumentLineInput[]);
  const id = randomUUID();

  await db.invoice.create({
    data: {
      id,
      customerId: input.customerId,
      quotationId: input.quotationId ?? null,
      salesOrderId: input.salesOrderId ?? null,
      notes: input.notes,
      items: { create: lines },
    },
  });

  const invoice = await getInvoice(db, id);

  if (!invoice) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  return invoice;
}

export async function createInvoice(db: Writer, input: InvoiceInput) {
  if (input.quotationId) {
    const quote = await db.quotation.findUnique({
      where: { id: input.quotationId },
      include: { items: true },
    });

    if (!quote) {
      throw new DocumentNotFoundError("Quotation not found.");
    }

    if (quote.status !== "ACCEPTED" && quote.status !== "CONVERTED") {
      throw new DocumentStateError("Create an invoice after the quotation is accepted.");
    }

    const existing = await db.invoice.findFirst({
      where: { quotationId: quote.id, status: { in: ["DRAFT", "ISSUED"] } },
      select: { id: true },
    });

    if (existing) {
      throw new DocumentStateError("This quotation already has an invoice.");
    }

    return createInvoiceRecord(db, {
      customerId: quote.customerId,
      quotationId: quote.id,
      salesOrderId: quote.salesOrderId,
      notes: input.notes ?? quote.notes,
      items: quote.items,
    });
  }

  if (!input.items) {
    throw new DocumentStateError("Add at least one product.");
  }

  return createInvoiceRecord(db, {
    customerId: input.customerId,
    notes: input.notes,
    items: input.items,
  });
}

export async function updateInvoice(db: Writer, id: string, input: InvoiceInput) {
  const current = await db.invoice.findUnique({ where: { id }, select: { status: true, quotationId: true } });

  if (!current) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  if (current.status !== "DRAFT") {
    throw new DocumentStateError("An issued invoice stays as it was issued.");
  }

  if (current.quotationId || input.quotationId) {
    throw new DocumentStateError("An invoice copied from a quotation keeps those lines.");
  }

  if (!input.items) {
    throw new DocumentStateError("Add at least one product.");
  }

  await activeCustomer(db, input.customerId);
  const lines = await pricedLines(db, input.items);
  await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
  await db.invoice.update({
    where: { id },
    data: { customerId: input.customerId, notes: input.notes, items: { create: lines } },
  });
  const invoice = await getInvoice(db, id);

  if (!invoice) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  return invoice;
}

export async function issueInvoice(db: Writer, id: string) {
  const current = await db.invoice.findUnique({ where: { id }, select: { status: true, number: true } });

  if (!current) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  if (current.status !== "DRAFT" || current.number) {
    throw new DocumentStateError("Only a draft invoice can be issued.");
  }

  const number = await nextSequence(db, "invoice_number_seq", "INV");
  await db.invoice.update({ where: { id }, data: { status: "ISSUED", number, issuedAt: new Date() } });
  const invoice = await getInvoice(db, id);

  if (!invoice) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  return invoice;
}

export async function cancelInvoice(db: Writer, id: string, reason: string) {
  const current = await db.invoice.findUnique({ where: { id }, select: { status: true } });

  if (!current) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  if (current.status !== "ISSUED") {
    throw new DocumentStateError("Cancel an invoice only after it has been issued.");
  }

  await db.invoice.update({ where: { id }, data: { status: "CANCELLED", cancelReason: reason } });
  const invoice = await getInvoice(db, id);

  if (!invoice) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  return invoice;
}

export async function deleteInvoice(db: Writer, id: string) {
  const current = await db.invoice.findUnique({ where: { id }, select: { status: true } });

  if (!current) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  if (current.status !== "DRAFT") {
    throw new DocumentStateError("An issued invoice stays on file.");
  }

  await db.invoice.delete({ where: { id } });
  return id;
}

function pdfDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(value);
}

export async function quotationPdf(db: Writer, id: string) {
  const quote = await getQuotation(db, id);

  if (!quote) {
    throw new DocumentNotFoundError("Quotation not found.");
  }

  return {
    filename: `${quote.number}-r${quote.revision}.pdf`,
    body: buildDocumentPdf({
      kind: "Quotation",
      number: `${quote.number} revision ${quote.revision}`,
      status: quote.status,
      customer: quote.customer.name,
      dateLabel: pdfDate(quote.createdAt),
      extra: quote.validUntil ? [`Valid until: ${pdfDate(quote.validUntil)}`] : [],
      lines: quote.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unit: documentUnitLabels[item.unit as keyof typeof documentUnitLabels] ?? item.unit,
        rate: item.rate,
        amount: item.amount,
      })),
      total: quote.total,
      notes: quote.notes,
      terms: quote.terms,
    }),
  };
}

export async function invoicePdf(db: Writer, id: string) {
  const invoice = await getInvoice(db, id);

  if (!invoice) {
    throw new DocumentNotFoundError("Invoice not found.");
  }

  return {
    filename: `${invoice.number ?? "draft-invoice"}.pdf`,
    body: buildDocumentPdf({
      kind: "Invoice",
      number: invoice.number ?? "Draft, number assigned on issue",
      status: invoice.status,
      customer: invoice.customer.name,
      dateLabel: pdfDate(invoice.issuedAt ?? invoice.createdAt),
      extra: invoice.cancelReason ? [`Cancellation: ${invoice.cancelReason}`] : [],
      lines: invoice.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unit: documentUnitLabels[item.unit as keyof typeof documentUnitLabels] ?? item.unit,
        rate: item.rate,
        amount: item.amount,
      })),
      total: invoice.total,
      notes: invoice.notes,
      terms: null,
    }),
  };
}

export function listTotal(items: { quantity: Prisma.Decimal; rate: Prisma.Decimal }[]) {
  return money(items.reduce((sum, item) => sum.plus(lineAmount(item.quantity, item.rate)), new Prisma.Decimal(0)));
}

export type { InvoiceStatus, QuotationStatus };
