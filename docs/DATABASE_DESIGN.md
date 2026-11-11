# FK Marble database design

The live schema is `prisma/schema.prisma`. This document describes that schema and the models the blueprint still requires. Do not treat the planned models as tables that already exist.

## Live connection

- Engine: PostgreSQL on Neon.
- Application URL: pooled `DATABASE_URL` in `.env.local`.
- Migration URL: direct `DATABASE_URL_UNPOOLED`.
- Schema: `public`.
- Applied migrations start with `20261106103000_init`. Later migrations add Hindi catalogue fields, staff roles and sessions, and the audit log.
- Timestamps are stored by Prisma as `DateTime`. The UI shows Indian local time where a clock is rendered.

## Tables that exist

### AdminUser

Staff account. Fields: `id`, `name`, unique `email`, `passwordHash`, `role`, `isActive`, `createdAt`, `updatedAt`. `role` is `OWNER`, `ADMIN`, `MANAGER`, `SALES`, `PURCHASE`, `INVENTORY`, or `ACCOUNTANT`. The password column stores a scrypt hash. No row is seeded. There is no public registration. Create the first owner with `npm run admin:create-owner` after setting the owner variables locally.

### AdminSession

A revocable sign-in. The cookie stores a random token. The database stores only the SHA-256 hash of that token, plus `expiresAt` and `revokedAt`. Deleting the staff account deletes its sessions.

### AuditLog

One row per admin write. Fields: `actorId`, `action`, `entityType`, `entityId`, `summary`, and `createdAt`. Deleting a staff account keeps the row and clears `actorId`. The summary is a short sentence. Passwords and session tokens are not stored. Permissions are checked in application code from the staff role. They are not a separate permission table.

### Category

One category has many products. Delete is restricted while products point at it. Fields include unique `slug`, `description`, `image`, `isActive`, and `displayOrder`. Optional `nameHi` and `descriptionHi` store the Hindi copy on the same row. `image` is a site path. A picture chosen from a computer is stored as `/uploads/categories/...`.

Seeded slugs: `tiles`, `marble`, `granite`, `kota-stone`, `sandstone`, `natural-stone`.

### Product

Belongs to one category. Optional `price`, `wholesalePrice`, and `costPrice` are `Decimal(12, 2)`. `showPrice` defaults to false. Wholesale and cost prices are for staff screens only. `isDemo` marks development samples. Public queries exclude demo and inactive rows. Optional `nameHi`, `descriptionHi`, `materialHi`, `finishHi`, `colorHi`, `usageHi`, and `availabilityHi` store Hindi on the same product. Size and thickness are not translated.

### ProductImage

Many images per product. Deleting a product deletes its images. A picture chosen from a computer is stored as `/uploads/products/...`. `cloudinaryPublicId` is optional and unused until Cloudinary credentials are added.

### Enquiry

A website enquiry. `enquiryType` is `WHOLESALE` or `RETAIL`. `status` defaults to `PENDING` and may be `CONTACTED`, `COMPLETED`, or `CANCELLED`. `productId` is optional and is set to null if the product is removed. Quantity uses `Decimal(12, 2)`. The later status names are planned in `docs/ENQUIRY_STATUS_PLAN.md`. The live enum has not been changed.

### Supplier

A business that supplies stone or surfaces. Fields: `name`, optional `contactName`, `phone`, `email`, `address`, `gstin`, and `notes`, plus `isActive`. No opening balance or payment is stored on this row.

### PurchaseOrder

A quantity order for one supplier. `status` is `DRAFT`, `APPROVED`, `PARTIALLY_RECEIVED`, `RECEIVED`, or `CANCELLED`. `number` is unique. Lines store the ordered quantity and the quantity already received. There is no cost, tax, or payment on the order.

### GoodsReceipt

A delivery against one purchase order. Each line points at one order line and stores the quantity received. Deleting a receipt is not offered. A later correction is a reversal, not a silent delete.

### StockMovement

On-hand stock is the sum of movements for a product. A purchase receipt adds a positive quantity. A sales dispatch adds a negative quantity. The public product API does not include this quantity or any cost.

### Customer

A person or business that buys stone or surfaces. `type` is `RETAIL`, `WHOLESALE`, `CONTRACTOR`, `BUILDER`, `ARCHITECT`, or `WALK_IN`. Fields also include `name`, optional `contactName`, `phone`, `email`, `address`, `gstin`, and `notes`, plus `isActive`. No opening balance or credit limit is stored on this row.

### SalesOrder

A quantity order for one customer. `status` is `DRAFT`, `APPROVED`, `PARTIALLY_RESERVED`, `RESERVED`, `PARTIALLY_DISPATCHED`, `DISPATCHED`, or `CANCELLED`. `number` is unique. Lines store the ordered, reserved, and dispatched quantities. There is no price, tax, or payment on the order.

### DispatchNote

A delivery against one sales order. Each line points at one order line and stores the quantity dispatched. The matching stock movement uses `SALES_DISPATCH` and a negative quantity. Deleting a dispatch is not offered.

### BusinessSettings

One seeded row for FK Marble: name, tagline, phone, WhatsApp, address, city, state, opening time, closing time, and description.

## Planned tables

These names come from the master blueprint. They are not in the migration yet:

User, Role, Permission, UserRole, RolePermission, ProductVariant, ProductSpecification, PriceList, ProductPrice, CustomerAddress, CustomerContact, SupplierContact, Warehouse, WarehouseLocation, StockBatch, StockAdjustment, StockTransfer, Slab, Unit, UnitConversion, PurchaseInvoice, PurchaseReturn, SalesReturn, EnquiryItem, Payment, PaymentAllocation, Expense, Account, JournalEntry, JournalEntryLine, TaxRate, Notification.

Quotation, QuotationItem, Invoice, and InvoiceItem are in migration `20261111153000_quotations_and_invoices`. A new revision is another quotation row with the same number. Invoice numbers come from the Postgres sequence `invoice_number_seq`, and quotation numbers come from `quotation_number_seq`. An issued invoice is cancelled by status, not by deleting the row. The quoted rate is not the product cost or wholesale price.

Adding them will be a new migration after the public-website milestones. Existing rows will not be deleted to make room for that schema.

## Money and stock rules for later migrations

- Financial amounts stay `Decimal`.
- Posted invoices and journal lines are corrected by reversal, not by silent deletion.
- Stock changes will write a ledger row inside a transaction.
- Negative stock stays disallowed until a business setting explicitly allows it.
