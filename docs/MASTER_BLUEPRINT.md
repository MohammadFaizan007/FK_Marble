# FK MARBLE — COMPLETE MASTER PROJECT BLUEPRINT
## Premium Website + Advanced Admin ERP + Future Mobile Application

Act as the Principal Software Architect, Senior Next.js Developer, Backend Engineer, Database Architect, ERP Consultant, UI/UX Designer, QA Engineer and Security Engineer for FK Marble.

Your responsibility is to develop FK Marble into a complete, production-ready digital business management platform.

This is the MASTER PROJECT SPECIFICATION.

Treat this document as the permanent source of truth for all future development.

Do not repeatedly ask the user for separate implementation prompts.
Use this blueprint, inspect the existing project, maintain project documentation and continue development phase by phase.

========================================================
1. BUSINESS INFORMATION
========================================================

Business Name: FK Marble
Brand Identity: FK MARBLE — STONE & SURFACES

Business Type:
- Marble showroom
- Tiles showroom
- Granite supplier
- Natural stone supplier
- Wholesale business
- Retail business

Business Address:
177, ITI Chauraha,
Etawah, Uttar Pradesh, India.

Business Phone:
9045760027

WhatsApp:
919045760027

Business Hours:
9:00 AM to 8:00 PM.

Business Location:
Etawah, Uttar Pradesh, India.

Website Languages:
- English
- Hindi

Business Model:
Wholesale and Retail.

Primary Goal:

Build a premium product catalogue website and a complete business management ERP for FK Marble.

The website and admin panel must share the same backend and database.

A future Android and iOS mobile application will be developed using Kotlin Compose Multiplatform.

IMPORTANT:
Do not start mobile application development in this project phase.

Build mobile-compatible REST APIs and backend architecture now.

========================================================
2. DEVELOPMENT PRIORITIES
========================================================

Follow this exact development order.

PHASE 1 — Existing Project Audit and Foundation
PHASE 2 — Complete Public Website
PHASE 3 — Database and Backend APIs
PHASE 4 — Advanced Admin Dashboard
PHASE 5 — Product and Inventory Management
PHASE 6 — Purchase and Supplier Management
PHASE 7 — Sales and Customer Management
PHASE 8 — Quotations and Invoicing
PHASE 9 — Accounting and Financial Management
PHASE 10 — Reports and Analytics
PHASE 11 — Security, Testing and Production Deployment
PHASE 12 — Future CMP Mobile Application Preparation

Do not skip phases.

Do not unnecessarily rewrite completed modules.

========================================================
3. EXISTING PROJECT AUDIT
========================================================

Before making any changes, inspect the entire existing project.

The project has already started development.

Existing work includes:
- Next.js project setup.
- Branding and FK Marble logo.
- Homepage.
- Product category sections.
- Product catalogue frontend.
- Product detail page foundation.
- Category routes.
- WhatsApp integration.
- PostgreSQL database created on Neon.
- Prisma integration started.

Inspect:

- package.json
- next.config
- tsconfig.json
- Prisma schema
- Environment configuration
- App Router
- Components
- Existing styles
- Product mock data
- API routes
- Existing services
- README
- Git status

Create a development audit document:

docs/PROJECT_AUDIT.md

Document:
- Existing implementation.
- Working functionality.
- Incomplete functionality.
- Errors.
- Technical debt.
- Missing dependencies.
- Database status.
- Recommended corrections.

Do not overwrite working implementations.

Do not delete existing user work.

Do not expose database credentials.

Do not run destructive database operations.

========================================================
4. PERMANENT PROJECT DOCUMENTATION
========================================================

Create and maintain these documents:

docs/MASTER_BLUEPRINT.md
docs/PROJECT_AUDIT.md
docs/ARCHITECTURE.md
docs/DATABASE_DESIGN.md
docs/API_DOCUMENTATION.md
docs/DEVELOPMENT_ROADMAP.md
docs/SECURITY_GUIDELINES.md
docs/TESTING_GUIDELINES.md
docs/DEPLOYMENT_GUIDE.md
docs/CHANGELOG.md
docs/KNOWN_ISSUES.md

Create:

docs/DEVELOPMENT_STATUS.md

This is the most important project progress file.

After completing every milestone, update:

- Current phase.
- Completed modules.
- In-progress modules.
- Pending modules.
- Files created.
- Files modified.
- Tests executed.
- Build status.
- Known issues.
- Next implementation task.

When development is resumed in a new Cursor session, first read DEVELOPMENT_STATUS.md and the relevant architecture documentation.

Never lose development progress.

========================================================
5. TECHNOLOGY STACK
========================================================

Use the following stack, adapting to compatible versions already installed.

FRONTEND:
- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- React Hook Form where appropriate.
- Zod validation.

BACKEND:
- Next.js Route Handlers.
- REST API.
- Modular service architecture.
- Server-side validation.
- Centralized error handling.

DATABASE:
- PostgreSQL.
- Neon hosted PostgreSQL.
- Prisma ORM.

AUTHENTICATION:
- Secure web sessions.
- Role-based access control.
- Secure password hashing.
- CSRF protection where applicable.
- Rate limiting.

FILE STORAGE:
- Cloudinary.
- Multiple product images.
- Optimized responsive images.

INTERNATIONALIZATION:
- Hindi.
- English.

TESTING:
- Vitest or compatible unit testing.
- Playwright for end-to-end tests.
- Prisma/database integration tests.

DEPLOYMENT:
- Vercel for Next.js.
- Neon for PostgreSQL.
- Cloudinary for images.

Do not upgrade major dependencies without evaluating compatibility.

========================================================
6. ARCHITECTURE PRINCIPLES
========================================================

Use a modular monolith architecture.

Keep business logic separate from UI components.

Recommended logical modules:

1. Identity and Authentication
2. User and Permission Management
3. Product Catalogue
4. Category Management
5. Product Pricing
6. Image Management
7. Inventory Management
8. Warehouse Management
9. Purchase Management
10. Supplier Management
11. Sales Management
12. Customer Management
13. Quotation Management
14. Invoice Management
15. Payment Management
16. Accounting
17. Expense Management
18. Reports and Analytics
19. Notifications
20. Audit Logging
21. Business Settings

All modules must communicate through well-defined services and repositories.

Use:

- Server Components for server-rendered pages.
- Client Components only where interaction requires them.
- Server-only database access.
- Typed API contracts.
- Shared validation schemas.
- Centralized permissions.
- Database transactions for financial and inventory operations.

Do not create unnecessary microservices.

Do not couple business logic to React components.

========================================================
7. BRANDING AND UI/UX DESIGN SYSTEM
========================================================

Preserve the existing FK Marble branding.

Visual identity:

- Premium.
- Elegant.
- Minimal.
- Luxury stone showroom.
- Natural material inspiration.

Color palette:

- Warm cream.
- Off-white.
- Charcoal.
- Natural stone beige.
- Muted gold.
- Neutral grey.

Use the existing logo and typography wherever possible.

PUBLIC WEBSITE:
Maintain the existing premium showroom design.

ADMIN DASHBOARD:
Use a separate professional ERP design.

Admin design should prioritize:
- Readability.
- Data density.
- Clear navigation.
- Fast operations.
- Responsive tables.
- Dashboard analytics.
- Efficient forms.

Avoid excessive animations and unnecessary visual effects.

Create reusable:
- Buttons.
- Inputs.
- Selects.
- Dialogs.
- Drawers.
- Data tables.
- Cards.
- Status indicators.
- Form layouts.
- Empty states.
- Loading states.
- Error states.

The website and admin dashboard should be responsive.

Admin must work on desktop, tablet and mobile browsers.

========================================================
8. BILINGUAL WEBSITE
========================================================

Support Hindi and English from the beginning.

Implement proper internationalization.

Suggested routes:

/en
/en/products
/en/categories/tiles

/hi
/hi/products
/hi/categories/tiles

Requirements:

- Language switcher.
- Persistent language preference.
- Localized navigation.
- Localized product descriptions.
- Localized category descriptions.
- Localized buttons.
- Localized validation messages.
- Localized SEO metadata.
- Localized business information.

Do not translate product data dynamically on every page load.

Store English and Hindi product/category content in a maintainable multilingual data structure.

Avoid duplicating products for each language.

Preserve correct Hindi typography.

========================================================
9. PUBLIC WEBSITE
========================================================

Complete the premium FK Marble website.

MAIN NAVIGATION:

- Home
- Collections
- About Us
- Gallery
- Contact Us
- WhatsApp

HOMEPAGE:

- Premium hero section.
- Brand introduction.
- Category collections.
- Featured products.
- Why choose FK Marble.
- Wholesale and retail information.
- Project gallery.
- Customer enquiry CTA.
- Showroom information.
- Footer.

PRODUCT CATEGORIES:

1. Tiles
2. Marble
3. Granite
4. Kota Stone
5. Sandstone
6. Other Natural Stone

ALL PRODUCTS PAGE:

- Search.
- Category filter.
- Material filter.
- Color filter.
- Finish filter.
- Size filter.
- Sorting.
- Pagination.
- Active filter chips.
- Empty state.
- Loading state.

PRODUCT DETAIL PAGE:

- Multiple images.
- Image gallery.
- Product description.
- Product specifications.
- Material.
- Color.
- Finish.
- Thickness.
- Size.
- Usage.
- Availability.
- Request price.
- WhatsApp enquiry.
- Related products.

CUSTOMER ENQUIRY:

- Customer name.
- Phone.
- Email.
- Product.
- Quantity.
- Unit.
- Wholesale or retail.
- Message.

Do not require online payment or checkout in the first release.

Keep pricing configurable by admin.

Never show fake prices, fake ratings or fake inventory.

DEMO PRODUCTS MUST NEVER BE PRESENTED AS ACTUAL FK MARBLE STOCK.

CONTACT:

Use the actual FK Marble contact details.

Include click-to-call, WhatsApp and map directions.

========================================================
10. DATABASE DESIGN
========================================================

Design the database for a single FK Marble business, with clean boundaries that allow future expansion.

Use proper primary keys, foreign keys, unique constraints, indexes and relations.

CORE MODELS:

IDENTITY:
- User
- Role
- Permission
- UserRole
- RolePermission
- Session or authentication records as required.

CATALOGUE:
- Category
- Product
- ProductVariant
- ProductImage
- ProductSpecification
- PriceList
- ProductPrice

CUSTOMER:
- Customer
- CustomerAddress
- CustomerContact

SUPPLIER:
- Supplier
- SupplierContact

INVENTORY:
- Warehouse
- WarehouseLocation
- InventoryItem or stock-managed product variant
- StockBatch
- StockMovement
- StockAdjustment
- StockTransfer
- Slab
- Unit
- UnitConversion

PURCHASE:
- PurchaseOrder
- PurchaseOrderItem
- GoodsReceipt
- GoodsReceiptItem
- PurchaseInvoice
- PurchaseReturn
- PurchaseReturnItem

SALES:
- SalesOrder
- SalesOrderItem
- SalesInvoice
- SalesInvoiceItem
- SalesReturn
- SalesReturnItem

ENQUIRIES:
- Enquiry
- EnquiryItem
- Quotation
- QuotationItem
- QuotationRevision

FINANCE:
- Payment
- PaymentAllocation
- Expense
- Account
- JournalEntry
- JournalEntryLine
- TaxRate

OPERATIONS:
- Notification
- AuditLog
- BusinessSettings
- DocumentSequence

Use Decimal for financial values.

Use UTC timestamps in the database and display local Indian time in the UI.

Use soft deletion or archival for business records where appropriate.

Never permanently delete posted financial transactions.

Use controlled correction and reversal workflows.

========================================================
11. ADVANCED PRODUCT MANAGEMENT
========================================================

Create a complete product management module.

PRODUCT FIELDS:

- Product name.
- SKU.
- Barcode.
- Slug.
- Category.
- Description.
- English description.
- Hindi description.
- Material.
- Color.
- Finish.
- Thickness.
- Size.
- Usage.
- Brand or origin where applicable.
- Product images.
- Product variants.
- Wholesale price.
- Retail price.
- Cost price.
- Tax category.
- Unit.
- Availability.
- Active/inactive status.
- Featured status.

PRODUCT IMAGE MANAGEMENT:

- Upload multiple images.
- Set primary image.
- Reorder images.
- Delete images with confirmation.
- Add image alt text.
- Cloudinary storage.
- Image optimization.

PRODUCT PRICING:

Support:
- Retail pricing.
- Wholesale pricing.
- Customer-specific pricing where authorized.
- Price history.
- Effective dates.
- Discounts.

Never expose internal cost price or wholesale price to unauthorized users.

Do not assume every product has a fixed price.

========================================================
12. MARBLE AND STONE SPECIFIC INVENTORY
========================================================

This module is a major business requirement.

Support:

UNITS:
- Square Feet.
- Square Meter.
- Piece.
- Slab.
- Box.
- Ton.
- Bundle.
- Kilogram.

Create proper unit conversion rules.

Do not assume every unit can be converted into every other unit.

MARBLE AND GRANITE SLAB TRACKING:

Each individually tracked slab can contain:

- Slab ID.
- Slab number.
- Product.
- Material.
- Color.
- Lot or batch.
- Length.
- Width.
- Thickness.
- Calculated area.
- Unit.
- Purchase cost.
- Selling price.
- Warehouse.
- Location.
- Quality grade.
- Surface finish.
- Availability status.
- Image.
- Barcode or QR identifier.

Support:
- Available.
- Reserved.
- Sold.
- Damaged.
- Returned.
- Transferred.

Calculate slab area using configured units and conversion rules.

Do not assume a slab's area is identical to other slabs of the same product.

STOCK LEDGER:

Every stock movement must create a traceable record.

Stock changes must not happen through arbitrary quantity editing.

Support:
- Opening stock.
- Purchase receipt.
- Sales issue.
- Purchase return.
- Sales return.
- Stock adjustment.
- Damage.
- Transfer.
- Reservation and release.

Use database transactions.

Prevent negative stock unless an explicitly authorized business setting allows it.

Provide stock movement history.

========================================================
13. PURCHASE AND SUPPLIER MANAGEMENT
========================================================

Implement:

SUPPLIER:
- Supplier name.
- Contact person.
- Phone.
- Email.
- Address.
- GSTIN where applicable.
- Opening balance.
- Notes.
- Status.

PURCHASE WORKFLOW:

Draft Purchase Order
-> Approved Purchase Order
-> Goods Received
-> Stock Updated
-> Purchase Invoice
-> Supplier Payment
-> Completed.

Support:
- Partial deliveries.
- Purchase returns.
- Multiple products.
- Different units.
- Freight and additional charges.
- Tax calculations.
- Discounts.
- Supplier outstanding balance.

Maintain complete purchase history.

========================================================
14. SALES AND CUSTOMER MANAGEMENT
========================================================

CUSTOMER TYPES:

- Retail.
- Wholesale.
- Contractor.
- Builder.
- Architect.
- Walk-in.

CUSTOMER DATA:

- Name.
- Phone.
- Email.
- Address.
- GSTIN where applicable.
- Customer type.
- Opening balance.
- Credit limit where authorized.
- Notes.

SALES WORKFLOW:

Customer Enquiry
-> Quotation
-> Customer Approval
-> Sales Order
-> Stock Reservation
-> Dispatch
-> Sales Invoice
-> Payment
-> Completed.

Support:
- Multiple products.
- Product variants.
- Slab selection.
- Quantity.
- Unit.
- Rate.
- Discount.
- Taxes.
- Freight.
- Partial payments.
- Sales returns.

Keep a full customer transaction history.

========================================================
15. QUOTATION AND INVOICE MANAGEMENT
========================================================

QUOTATION:

- Unique quotation number.
- Customer.
- Quotation date.
- Validity.
- Products.
- Quantity.
- Unit.
- Price.
- Discount.
- Tax.
- Freight.
- Grand total.
- Terms.
- Notes.
- Status.

Generate professional PDF quotations.

Support:
- Draft.
- Sent.
- Accepted.
- Rejected.
- Expired.
- Converted to order.

Allow controlled quotation revisions.

INVOICES:

- Unique invoice number.
- Customer.
- Invoice date.
- Items.
- Tax details.
- Discount.
- Total.
- Payments.
- Balance.
- Payment status.

Support appropriate tax invoice and non-tax document formats.

Implement document numbering using database-safe sequences.

Prevent duplicate invoice numbers.

Issued financial documents must not be silently editable or deletable.

========================================================
16. ACCOUNTING AND FINANCIAL MANAGEMENT
========================================================

Build accounting on a proper double-entry accounting foundation.

Do not build profit and loss using simple sales minus purchases.

ACCOUNTING MODULES:

- Chart of Accounts.
- Journal Entries.
- Cash Accounts.
- Bank Accounts.
- Customer Receivables.
- Supplier Payables.
- Sales Revenue.
- Purchase Expenses.
- Operating Expenses.
- Inventory Assets.
- Tax Accounts.
- Payment Allocations.

Every posted financial transaction must create balanced journal entries.

Implement:
- Debit and credit validation.
- Accounting periods.
- Opening balances.
- Journal entry references.
- Reversal entries.
- Payment reconciliation.
- Audit history.

FINANCIAL REPORTS:

- Profit and Loss.
- Balance Sheet.
- Trial Balance.
- Cash Flow.
- Customer Ledger.
- Supplier Ledger.
- Receivables.
- Payables.
- Expense Report.
- Sales Report.
- Purchase Report.

GST:

Prepare support for:
- GSTIN.
- HSN/SAC.
- Tax rates.
- CGST.
- SGST.
- IGST.
- Taxable amount.
- Tax reports.

Validate GST calculations, invoice rules and statutory requirements with a qualified accountant before production use.

Do not claim legal or tax compliance without verification.

========================================================
17. ADVANCED ADMIN DASHBOARD
========================================================

Create a secure admin application.

Suggested route structure:

/admin/login
/admin/dashboard
/admin/products
/admin/categories
/admin/pricing
/admin/inventory
/admin/slabs
/admin/warehouses
/admin/purchases
/admin/suppliers
/admin/sales
/admin/customers
/admin/enquiries
/admin/quotations
/admin/invoices
/admin/payments
/admin/expenses
/admin/accounting
/admin/reports
/admin/users
/admin/roles
/admin/settings
/admin/audit-logs

DASHBOARD WIDGETS:

- Total sales.
- Today's sales.
- Monthly revenue.
- Purchases.
- Gross profit.
- Net profit.
- Outstanding customer payments.
- Supplier dues.
- Inventory value.
- Low-stock products.
- Pending enquiries.
- Pending quotations.
- Recent transactions.
- Sales charts.
- Purchase charts.
- Top products.

Provide date filters and report exports where appropriate.

All figures must come from actual database transactions.

Never display fabricated analytics.

========================================================
18. ROLE-BASED ACCESS CONTROL
========================================================

Implement roles:

OWNER
ADMIN
MANAGER
SALES
PURCHASE
INVENTORY
ACCOUNTANT

Permissions must be granular.

Examples:

- Product view.
- Product create.
- Product update.
- Product delete/archive.
- Price view.
- Price update.
- Cost price view.
- Stock view.
- Stock adjustment.
- Purchase create.
- Purchase approve.
- Sales create.
- Invoice issue.
- Payment record.
- Expense record.
- Financial report view.
- User management.

The owner has full access.

The server must validate permissions on every protected operation.

Hiding buttons in the frontend is not sufficient security.

Record important activities in AuditLog.

Prevent users from assigning permissions they do not possess.

========================================================
19. CUSTOMER ENQUIRIES AND NOTIFICATIONS
========================================================

Support enquiries from:

- Website.
- Admin-created customer records.
- Future mobile application.

Enquiry fields:

- Customer.
- Phone.
- Product.
- Quantity.
- Unit.
- Enquiry type.
- Message.
- Source.
- Assigned staff.
- Status.
- Follow-up date.

Statuses:

- New.
- Contacted.
- Quoted.
- Converted.
- Closed.
- Cancelled.

Notifications:

- New enquiry.
- New quotation.
- Low stock.
- Purchase received.
- Payment received.
- Outstanding payment.
- Important business approvals.

Prepare email and WhatsApp integration through approved providers.

Do not expose customer data publicly.

========================================================
20. FUTURE MOBILE APPLICATION COMPATIBILITY
========================================================

The mobile application will be developed only after the website and admin ERP are completed and stabilized.

Future technology:

- Kotlin Multiplatform.
- Compose Multiplatform.
- MVVM.
- Repository pattern.
- Ktor Client.
- Coroutines.
- StateFlow.
- Shared validation and business models where practical.

Future mobile audiences:

CUSTOMER:
- Browse catalogue.
- Search products.
- Favourites.
- Enquiries.
- Quotations.
- Orders.
- Notifications.

STAFF:
- Customer management.
- Quotations.
- Sales.
- Inventory lookup.
- Purchase entry where authorized.

OWNER:
- Business dashboard.
- Reports.
- Approvals.
- Sales and purchase overview.
- Financial summaries.

Backend APIs must remain independent of web UI.

Use stable IDs, versioned routes, typed JSON responses, pagination and standardized errors.

Future API root:

/api/v1

Do not build mobile UI or CMP modules now.

========================================================
21. API ARCHITECTURE
========================================================

Use REST APIs with consistent responses.

Example:

{
  "success": true,
  "message": "Products fetched successfully",
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

Use appropriate HTTP status codes.

Implement:
- Authentication.
- Authorization.
- Validation.
- Pagination.
- Filtering.
- Sorting.
- Error handling.
- Rate limiting.
- Request logging.
- API versioning.

Use Zod for request validation.

Never trust client-supplied prices, totals, discounts or permissions.

Calculate financial totals on the server.

Protect all admin APIs.

========================================================
22. SECURITY
========================================================

Implement production-grade security.

Requirements:

- Secure password hashing.
- Secure web sessions.
- Appropriate token lifecycle for future mobile APIs.
- Role-based authorization.
- CSRF protection where applicable.
- XSS prevention.
- SQL injection prevention through safe ORM usage.
- Rate limiting.
- Input validation.
- Secure file uploads.
- Image type and size validation.
- Environment secret protection.
- Secure headers.
- Audit logs.
- Session revocation.
- Login throttling.
- Sensitive data protection.

Do not store passwords in plain text.

Do not expose database credentials.

Do not put secrets in NEXT_PUBLIC variables.

Do not disable SSL verification.

Do not create a publicly accessible admin registration page.

========================================================
23. BACKUP AND DATA RELIABILITY
========================================================

Plan:

- Automated database backups.
- Backup retention.
- Recovery documentation.
- Migration safety.
- Transaction integrity.
- Error monitoring.
- Audit trail.
- Data export.

Document database restoration procedures.

Do not run destructive production migrations without explicit approval and backup verification.

========================================================
24. TESTING AND QUALITY ASSURANCE
========================================================

Create comprehensive testing.

UNIT TESTS:
- Price calculations.
- Tax calculations.
- Quantity conversions.
- Slab area calculations.
- Stock calculations.
- Permission checks.
- Financial ledger balancing.

INTEGRATION TESTS:
- Product CRUD.
- Category CRUD.
- Purchase receipt.
- Sales order.
- Inventory movement.
- Quotation.
- Invoice.
- Payment allocation.
- Accounting entries.

END-TO-END TESTS:
- Customer browsing.
- Language switching.
- Product enquiry.
- Admin login.
- Product creation.
- Image upload.
- Purchase workflow.
- Sales workflow.
- Quotation PDF.
- Invoice generation.
- Role restrictions.

RESPONSIVE TESTS:
- Mobile.
- Tablet.
- Desktop.

ACCESSIBILITY:
- Keyboard navigation.
- Accessible forms.
- Semantic HTML.
- Contrast.
- Image alt text.

Do not claim tests passed without actually executing them.

========================================================
25. PERFORMANCE AND SEO
========================================================

Website:

- Server-side rendering where appropriate.
- Optimized images.
- Lazy loading.
- Efficient database queries.
- Pagination.
- Caching with correct invalidation.
- SEO metadata.
- Canonical URLs.
- Sitemap.
- Robots.txt.
- Structured data.
- Local business information.
- Open Graph.
- Hindi and English indexing.

Do not cache private admin or customer financial data publicly.

========================================================
26. DEPLOYMENT
========================================================

Prepare production deployment.

Website and Admin:
- Vercel.

Database:
- Neon PostgreSQL.

Images:
- Cloudinary.

Configure:
- Production environment variables.
- Preview environment.
- Production database.
- Migration deployment.
- Secure domains.
- HTTPS.
- Error monitoring.
- Backup strategy.

Keep development, preview and production data separate.

Never seed demo data into production automatically.

Do not deploy financial or admin functionality until security and acceptance testing passes.

========================================================
27. CODING STANDARDS
========================================================

Follow:

- Strict TypeScript.
- Small reusable components.
- Clean architecture.
- Consistent naming.
- Separation of concerns.
- No unnecessary duplication.
- No giant component files.
- No business logic in UI.
- Proper error handling.
- Proper loading states.
- Proper empty states.
- No hardcoded secrets.
- No fake success responses.
- No unnecessary dependencies.

Use transactions for operations affecting both stock and financial records.

Keep business logic testable.

========================================================
28. CURSOR AI WORKING INSTRUCTIONS
========================================================

This section is mandatory.

Do not treat this blueprint as a request to generate all modules in one enormous code change.

Work in manageable milestones.

The user should not need to write a new prompt for every feature.

Follow these instructions:

1. First inspect the existing project.
2. Create and maintain the permanent project documentation.
3. Create a detailed milestone checklist.
4. Identify incomplete existing features.
5. Fix existing foundation problems before building dependent modules.
6. Implement modules in the specified phase order.
7. Complete one milestone at a time.
8. After each milestone, run relevant tests.
9. Fix implementation errors before moving forward.
10. Update DEVELOPMENT_STATUS.md.
11. Update API and database documentation.
12. Keep the project buildable after each milestone.
13. Preserve completed functionality.
14. Do not ask the user to repeat requirements already defined here.
15. Do not ask for confirmation for ordinary implementation decisions.
16. Make reasonable engineering decisions and document them.
17. Ask for explicit approval only for destructive operations, irreversible data changes, production deployment, or business decisions that cannot safely be inferred.
18. Do not invent real inventory, prices, financial transactions or customer records.
19. Clearly label all development demo data.
20. Do not silently skip incomplete features.

If context is lost or a new Cursor session starts:

- Read this master blueprint.
- Read DEVELOPMENT_STATUS.md.
- Read PROJECT_AUDIT.md.
- Read ARCHITECTURE.md.
- Inspect the current Git changes.
- Continue from the last verified milestone.

Never restart the entire project unnecessarily.

========================================================
29. DEFINITION OF DONE
========================================================

A module is complete only when:

- Implementation is finished.
- Database schema is correct.
- API is functional.
- Authorization is verified.
- Validation works.
- UI is integrated.
- Loading and error states exist.
- Unit tests are executed.
- Relevant integration tests are executed.
- Build passes.
- Documentation is updated.
- No known critical regression remains.

A module must not be marked complete merely because its UI has been generated.

========================================================
30. FIRST ACTION — START DEVELOPMENT
========================================================

Start by doing the following:

A. Inspect the entire existing FK Marble repository.

B. Create PROJECT_AUDIT.md.

C. Create MASTER_BLUEPRINT.md containing this complete specification.

D. Create ARCHITECTURE.md.

E. Create DEVELOPMENT_ROADMAP.md.

F. Create DEVELOPMENT_STATUS.md.

G. Inspect the existing Neon PostgreSQL and Prisma configuration.

H. Verify existing database connectivity without exposing credentials.

I. Identify any mismatch between the existing Step 4/Step 5 implementation and this blueprint.

J. Prepare a safe migration and implementation plan.

K. Do not delete or overwrite existing data.

L. Begin implementation from the first incomplete milestone.

M. Continue through the roadmap one verified milestone at a time.

At the end of each milestone, provide a concise report:

- What was implemented.
- Files created.
- Files modified.
- Database changes.
- APIs completed.
- Tests executed.
- Build result.
- Remaining work.
- Next milestone.

FINAL INSTRUCTION:

Build FK Marble as a maintainable, secure, production-ready business platform.

Prioritize correctness, data integrity, security, usability and maintainability over development speed.

The public website and complete admin/business management system must be finished before starting the CMP mobile application.

This blueprint remains the permanent source of truth for future FK Marble development.