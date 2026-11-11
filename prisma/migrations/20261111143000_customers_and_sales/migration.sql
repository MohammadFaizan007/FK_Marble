CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'CONTRACTOR', 'BUILDER', 'ARCHITECT', 'WALK_IN');

CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'APPROVED', 'PARTIALLY_RESERVED', 'RESERVED', 'PARTIALLY_DISPATCHED', 'DISPATCHED', 'CANCELLED');

ALTER TYPE "StockMovementType" ADD VALUE 'SALES_DISPATCH';

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "reservedQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dispatchedQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DispatchNote" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispatchNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DispatchLine" (
    "id" TEXT NOT NULL,
    "dispatchNoteId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "DispatchLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SalesOrder_number_key" ON "SalesOrder"("number");
CREATE INDEX "Customer_isActive_name_idx" ON "Customer"("isActive", "name");
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
CREATE INDEX "SalesOrder_status_createdAt_idx" ON "SalesOrder"("status", "createdAt");
CREATE INDEX "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");
CREATE UNIQUE INDEX "SalesOrderItem_salesOrderId_productId_key" ON "SalesOrderItem"("salesOrderId", "productId");
CREATE INDEX "SalesOrderItem_productId_idx" ON "SalesOrderItem"("productId");
CREATE INDEX "DispatchNote_salesOrderId_createdAt_idx" ON "DispatchNote"("salesOrderId", "createdAt");
CREATE INDEX "DispatchLine_dispatchNoteId_idx" ON "DispatchLine"("dispatchNoteId");
CREATE INDEX "DispatchLine_salesOrderItemId_idx" ON "DispatchLine"("salesOrderItemId");

ALTER TABLE "StockMovement" ADD COLUMN "dispatchLineId" TEXT;
CREATE UNIQUE INDEX "StockMovement_dispatchLineId_key" ON "StockMovement"("dispatchLineId");

ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DispatchNote" ADD CONSTRAINT "DispatchNote_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DispatchLine" ADD CONSTRAINT "DispatchLine_dispatchNoteId_fkey" FOREIGN KEY ("dispatchNoteId") REFERENCES "DispatchNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DispatchLine" ADD CONSTRAINT "DispatchLine_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_dispatchLineId_fkey" FOREIGN KEY ("dispatchLineId") REFERENCES "DispatchLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
