import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient, type AdminRole, type SalesOrderStatus } from "@/generated/prisma/client";
import type { SalesDispatchInput, SalesOrderInput, SalesReserveInput } from "@/lib/sales-schema";
import { hasPermission } from "@/lib/permissions";

type Writer = PrismaClient | Prisma.TransactionClient;

const openStatuses: SalesOrderStatus[] = ["APPROVED", "PARTIALLY_RESERVED", "RESERVED", "PARTIALLY_DISPATCHED", "DISPATCHED"];

const orderInclude = {
  customer: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true } } },
    orderBy: { product: { name: "asc" } },
  },
  dispatches: {
    include: { lines: true },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.SalesOrderInclude;

export class SalesOrderNotFoundError extends Error {
  constructor() {
    super("Sales order not found.");
    this.name = "SalesOrderNotFoundError";
  }
}

export class SalesOrderStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalesOrderStateError";
  }
}

export function salesAccess(role: AdminRole) {
  return {
    view: hasPermission(role, "sales.create") || hasPermission(role, "sales.approve"),
    create: hasPermission(role, "sales.create"),
    approve: hasPermission(role, "sales.approve"),
    stock: hasPermission(role, "stock.view"),
  };
}

function decimal(value: Prisma.Decimal | string | number) {
  return new Prisma.Decimal(value).toFixed(2);
}

function orderNumber() {
  return `SO-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function nextStatus(items: { quantity: Prisma.Decimal; reservedQuantity: Prisma.Decimal; dispatchedQuantity: Prisma.Decimal }[]): SalesOrderStatus {
  const allDispatched = items.every((item) => item.dispatchedQuantity.greaterThanOrEqualTo(item.quantity));
  const anyDispatched = items.some((item) => item.dispatchedQuantity.greaterThan(0));
  const allReserved = items.every((item) => item.reservedQuantity.greaterThanOrEqualTo(item.quantity));
  const anyReserved = items.some((item) => item.reservedQuantity.greaterThan(0));

  if (allDispatched) {
    return "DISPATCHED";
  }

  if (anyDispatched) {
    return "PARTIALLY_DISPATCHED";
  }

  if (allReserved) {
    return "RESERVED";
  }

  if (anyReserved) {
    return "PARTIALLY_RESERVED";
  }

  return "APPROVED";
}

export function listSalesOrders(db: PrismaClient) {
  return db.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });
}

async function heldByProduct(db: Writer, productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, Prisma.Decimal>();
  }

  const items = await db.salesOrderItem.findMany({
    where: { productId: { in: productIds }, salesOrder: { status: { in: openStatuses } } },
    select: { productId: true, reservedQuantity: true, dispatchedQuantity: true },
  });
  const held = new Map<string, Prisma.Decimal>();

  for (const item of items) {
    const current = held.get(item.productId) ?? new Prisma.Decimal(0);
    held.set(item.productId, current.plus(item.reservedQuantity.minus(item.dispatchedQuantity)));
  }

  return held;
}

async function onHandByProduct(db: Writer, productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, Prisma.Decimal>();
  }

  const sums = await db.stockMovement.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _sum: { quantity: true },
  });

  return new Map(sums.map((row) => [row.productId, row._sum.quantity ?? new Prisma.Decimal(0)]));
}

export async function getSalesOrder(db: Writer, id: string) {
  const order = await db.salesOrder.findUnique({ where: { id }, include: orderInclude });

  if (!order) {
    return null;
  }

  const productIds = order.items.map((item) => item.productId);
  const onHand = await onHandByProduct(db, productIds);
  const held = await heldByProduct(db, productIds);

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    notes: order.notes,
    customer: order.customer,
    createdAt: order.createdAt,
    items: order.items.map((item) => {
      const free = (onHand.get(item.productId) ?? new Prisma.Decimal(0)).minus(held.get(item.productId) ?? 0);
      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: decimal(item.quantity),
        reservedQuantity: decimal(item.reservedQuantity),
        dispatchedQuantity: decimal(item.dispatchedQuantity),
        toReserve: decimal(item.quantity.minus(item.reservedQuantity)),
        toDispatch: decimal(item.reservedQuantity.minus(item.dispatchedQuantity)),
        available: decimal(free.greaterThan(0) ? free : 0),
      };
    }),
    dispatches: order.dispatches.map((note) => ({
      id: note.id,
      notes: note.notes,
      createdAt: note.createdAt,
      lines: note.lines.map((line) => ({
        id: line.id,
        salesOrderItemId: line.salesOrderItemId,
        quantity: decimal(line.quantity),
      })),
    })),
  };
}

export async function createSalesOrder(db: Writer, input: SalesOrderInput) {
  const customer = await db.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true, isActive: true },
  });

  if (!customer?.isActive) {
    throw new SalesOrderStateError("Choose an active customer.");
  }

  const products = await db.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) } },
    select: { id: true, isActive: true, isDemo: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  for (const item of input.items) {
    const product = productById.get(item.productId);

    if (!product || !product.isActive || product.isDemo) {
      throw new SalesOrderStateError("Choose an active product that is not a demo sample.");
    }
  }

  const id = randomUUID();

  await db.salesOrder.create({
    data: {
      id,
      number: orderNumber(),
      customerId: input.customerId,
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

  const order = await getSalesOrder(db, id);

  if (!order) {
    throw new SalesOrderNotFoundError();
  }

  return order;
}

export async function approveSalesOrder(db: Writer, id: string) {
  const order = await db.salesOrder.findUnique({ where: { id }, select: { status: true } });

  if (!order) {
    throw new SalesOrderNotFoundError();
  }

  if (order.status !== "DRAFT") {
    throw new SalesOrderStateError("Only a draft order can be approved.");
  }

  await db.salesOrder.update({ where: { id }, data: { status: "APPROVED" } });
  const updated = await getSalesOrder(db, id);

  if (!updated) {
    throw new SalesOrderNotFoundError();
  }

  return updated;
}

export async function cancelSalesOrder(db: Writer, id: string) {
  const order = await db.salesOrder.findUnique({
    where: { id },
    select: { status: true, items: { select: { reservedQuantity: true } } },
  });

  if (!order) {
    throw new SalesOrderNotFoundError();
  }

  if (order.status !== "DRAFT" && order.status !== "APPROVED") {
    throw new SalesOrderStateError("This order can no longer be cancelled.");
  }

  if (order.items.some((item) => item.reservedQuantity.greaterThan(0))) {
    throw new SalesOrderStateError("Reserved goods stay on the stock record.");
  }

  await db.salesOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  const updated = await getSalesOrder(db, id);

  if (!updated) {
    throw new SalesOrderNotFoundError();
  }

  return updated;
}

export async function reserveSalesGoods(db: Writer, id: string, input: SalesReserveInput) {
  const order = await db.salesOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new SalesOrderNotFoundError();
  }

  if (order.status !== "APPROVED" && order.status !== "PARTIALLY_RESERVED" && order.status !== "RESERVED") {
    throw new SalesOrderStateError("Reserve goods only after the order is approved.");
  }

  const itemById = new Map(order.items.map((item) => [item.id, item]));
  const productIds = [...new Set(order.items.map((item) => item.productId))];
  const onHand = await onHandByProduct(db, productIds);
  const held = await heldByProduct(db, productIds);

  for (const line of input.lines) {
    const item = itemById.get(line.salesOrderItemId);

    if (!item || item.salesOrderId !== id) {
      throw new SalesOrderStateError("That line is not on this order.");
    }

    const quantity = new Prisma.Decimal(line.quantity);

    if (item.reservedQuantity.plus(quantity).greaterThan(item.quantity)) {
      throw new SalesOrderStateError("The reserved quantity is higher than the quantity still to reserve.");
    }

    const free = (onHand.get(item.productId) ?? new Prisma.Decimal(0)).minus(held.get(item.productId) ?? 0);

    if (quantity.greaterThan(free)) {
      throw new SalesOrderStateError("The reserved quantity is higher than the quantity still available.");
    }
  }

  for (const line of input.lines) {
    await db.salesOrderItem.update({
      where: { id: line.salesOrderItemId },
      data: { reservedQuantity: { increment: line.quantity } },
    });
  }

  const items = await db.salesOrderItem.findMany({ where: { salesOrderId: id } });
  await db.salesOrder.update({ where: { id }, data: { status: nextStatus(items) } });
  const updated = await getSalesOrder(db, id);

  if (!updated) {
    throw new SalesOrderNotFoundError();
  }

  return updated;
}

export async function dispatchSalesGoods(db: Writer, id: string, input: SalesDispatchInput) {
  const order = await db.salesOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new SalesOrderNotFoundError();
  }

  if (order.status !== "PARTIALLY_RESERVED" && order.status !== "RESERVED" && order.status !== "PARTIALLY_DISPATCHED") {
    throw new SalesOrderStateError("Dispatch goods only after they are reserved.");
  }

  const itemById = new Map(order.items.map((item) => [item.id, item]));

  for (const line of input.lines) {
    const item = itemById.get(line.salesOrderItemId);

    if (!item || item.salesOrderId !== id) {
      throw new SalesOrderStateError("That line is not on this order.");
    }

    if (item.dispatchedQuantity.plus(line.quantity).greaterThan(item.reservedQuantity)) {
      throw new SalesOrderStateError("The dispatched quantity is higher than the quantity still reserved.");
    }
  }

  const noteId = randomUUID();

  await db.dispatchNote.create({
    data: {
      id: noteId,
      salesOrderId: id,
      notes: input.notes,
      lines: {
        create: input.lines.map((line) => ({
          id: randomUUID(),
          salesOrderItemId: line.salesOrderItemId,
          quantity: line.quantity,
        })),
      },
    },
    include: { lines: true },
  });

  const note = await db.dispatchNote.findUniqueOrThrow({ where: { id: noteId }, include: { lines: true } });

  for (const line of note.lines) {
    const item = itemById.get(line.salesOrderItemId);

    if (!item) {
      throw new SalesOrderStateError("That line is not on this order.");
    }

    await db.salesOrderItem.update({
      where: { id: line.salesOrderItemId },
      data: { dispatchedQuantity: { increment: line.quantity } },
    });
    await db.stockMovement.create({
      data: {
        id: randomUUID(),
        productId: item.productId,
        type: "SALES_DISPATCH",
        quantity: new Prisma.Decimal(line.quantity).negated(),
        dispatchLineId: line.id,
      },
    });
  }

  const items = await db.salesOrderItem.findMany({ where: { salesOrderId: id } });
  await db.salesOrder.update({ where: { id }, data: { status: nextStatus(items) } });
  const updated = await getSalesOrder(db, id);

  if (!updated) {
    throw new SalesOrderNotFoundError();
  }

  return updated;
}
