import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient, type AdminRole } from "@/generated/prisma/client";
import type { GoodsReceiptInput, PurchaseOrderInput } from "@/lib/purchase-schema";
import { hasPermission } from "@/lib/permissions";

type Writer = PrismaClient | Prisma.TransactionClient;

const orderInclude = {
  supplier: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true } } },
    orderBy: { product: { name: "asc" } },
  },
  receipts: {
    include: { lines: true },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.PurchaseOrderInclude;

export class PurchaseOrderNotFoundError extends Error {
  constructor() {
    super("Purchase order not found.");
    this.name = "PurchaseOrderNotFoundError";
  }
}

export class PurchaseOrderStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseOrderStateError";
  }
}

export function purchaseAccess(role: AdminRole) {
  return {
    view: hasPermission(role, "purchase.create") || hasPermission(role, "purchase.approve"),
    create: hasPermission(role, "purchase.create"),
    approve: hasPermission(role, "purchase.approve"),
    stock: hasPermission(role, "stock.view"),
  };
}

function decimal(value: Prisma.Decimal | string | number) {
  return new Prisma.Decimal(value).toFixed(2);
}

function orderNumber() {
  return `PO-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function listPurchaseOrders(db: PrismaClient) {
  return db.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: { select: { name: true } } },
  });
}

export async function getPurchaseOrder(db: Writer, id: string) {
  const order = await db.purchaseOrder.findUnique({ where: { id }, include: orderInclude });

  if (!order) {
    return null;
  }

  const productIds = order.items.map((item) => item.productId);
  const sums =
    productIds.length === 0
      ? []
      : await db.stockMovement.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds } },
          _sum: { quantity: true },
        });
  const onHand = new Map(sums.map((row) => [row.productId, row._sum.quantity ?? new Prisma.Decimal(0)]));

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    notes: order.notes,
    supplier: order.supplier,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: decimal(item.quantity),
      receivedQuantity: decimal(item.receivedQuantity),
      remaining: decimal(item.quantity.minus(item.receivedQuantity)),
      onHand: decimal(onHand.get(item.productId) ?? 0),
    })),
    receipts: order.receipts.map((receipt) => ({
      id: receipt.id,
      notes: receipt.notes,
      createdAt: receipt.createdAt,
      lines: receipt.lines.map((line) => ({
        id: line.id,
        purchaseOrderItemId: line.purchaseOrderItemId,
        quantity: decimal(line.quantity),
      })),
    })),
  };
}

export async function createPurchaseOrder(db: Writer, input: PurchaseOrderInput) {
  const supplier = await db.supplier.findUnique({
    where: { id: input.supplierId },
    select: { id: true, isActive: true },
  });

  if (!supplier?.isActive) {
    throw new PurchaseOrderStateError("Choose an active supplier.");
  }

  const products = await db.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) } },
    select: { id: true, isActive: true, isDemo: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  for (const item of input.items) {
    const product = productById.get(item.productId);

    if (!product || !product.isActive || product.isDemo) {
      throw new PurchaseOrderStateError("Choose an active product that is not a demo sample.");
    }
  }

  const id = randomUUID();

  await db.purchaseOrder.create({
    data: {
      id,
      number: orderNumber(),
      supplierId: input.supplierId,
      notes: input.notes,
      items: {
        create: input.items.map((item) => ({
          id: randomUUID(),
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
  });

  const order = await getPurchaseOrder(db, id);

  if (!order) {
    throw new PurchaseOrderNotFoundError();
  }

  return order;
}

export async function approvePurchaseOrder(db: Writer, id: string) {
  const order = await db.purchaseOrder.findUnique({ where: { id }, select: { status: true } });

  if (!order) {
    throw new PurchaseOrderNotFoundError();
  }

  if (order.status !== "DRAFT") {
    throw new PurchaseOrderStateError("Only a draft order can be approved.");
  }

  await db.purchaseOrder.update({ where: { id }, data: { status: "APPROVED" } });
  const updated = await getPurchaseOrder(db, id);

  if (!updated) {
    throw new PurchaseOrderNotFoundError();
  }

  return updated;
}

export async function cancelPurchaseOrder(db: Writer, id: string) {
  const order = await db.purchaseOrder.findUnique({
    where: { id },
    select: { status: true, receipts: { select: { id: true }, take: 1 } },
  });

  if (!order) {
    throw new PurchaseOrderNotFoundError();
  }

  if (order.receipts.length > 0) {
    throw new PurchaseOrderStateError("Received goods stay on the stock record.");
  }

  if (order.status !== "DRAFT" && order.status !== "APPROVED") {
    throw new PurchaseOrderStateError("This order can no longer be cancelled.");
  }

  await db.purchaseOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  const updated = await getPurchaseOrder(db, id);

  if (!updated) {
    throw new PurchaseOrderNotFoundError();
  }

  return updated;
}

export async function receiveGoods(db: Writer, id: string, input: GoodsReceiptInput) {
  const order = await db.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new PurchaseOrderNotFoundError();
  }

  if (order.status !== "APPROVED" && order.status !== "PARTIALLY_RECEIVED") {
    throw new PurchaseOrderStateError("Receive goods only after the order is approved.");
  }

  const items = new Map(order.items.map((item) => [item.id, item]));

  for (const line of input.lines) {
    const item = items.get(line.purchaseOrderItemId);

    if (!item) {
      throw new PurchaseOrderStateError("That line is not on this order.");
    }

    if (item.receivedQuantity.plus(line.quantity).greaterThan(item.quantity)) {
      throw new PurchaseOrderStateError("The received quantity is higher than the quantity still due.");
    }
  }

  const receiptId = randomUUID();

  await db.goodsReceipt.create({
    data: { id: receiptId, purchaseOrderId: id, notes: input.notes },
  });

  for (const line of input.lines) {
    const item = items.get(line.purchaseOrderItemId);

    if (!item) {
      throw new PurchaseOrderStateError("That line is not on this order.");
    }

    const lineId = randomUUID();

    await db.goodsReceiptLine.create({
      data: {
        id: lineId,
        goodsReceiptId: receiptId,
        purchaseOrderItemId: item.id,
        quantity: line.quantity,
      },
    });
    await db.purchaseOrderItem.update({
      where: { id: item.id },
      data: { receivedQuantity: { increment: line.quantity } },
    });
    await db.stockMovement.create({
      data: {
        id: randomUUID(),
        productId: item.productId,
        type: "PURCHASE_RECEIPT",
        quantity: line.quantity,
        goodsReceiptLineId: lineId,
      },
    });
  }

  const updatedItems = await db.purchaseOrderItem.findMany({ where: { purchaseOrderId: id } });
  const complete = updatedItems.every((item) => item.receivedQuantity.greaterThanOrEqualTo(item.quantity));

  await db.purchaseOrder.update({
    where: { id },
    data: { status: complete ? "RECEIVED" : "PARTIALLY_RECEIVED" },
  });

  const updated = await getPurchaseOrder(db, id);

  if (!updated) {
    throw new PurchaseOrderNotFoundError();
  }

  return updated;
}
