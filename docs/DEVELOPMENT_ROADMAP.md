# FK Marble development roadmap

Work proceeds in this order. A milestone is finished only when its tests have been run and `docs/DEVELOPMENT_STATUS.md` is updated. Completed public pages and the current Prisma models are not rewritten.

## Phase 1 — Audit and foundation

| ID | Milestone | State |
| --- | --- | --- |
| 1.1 | Repository audit and permanent documentation | Complete |
| 1.2 | Confirm Neon connectivity without printing credentials | Complete |

## Phase 2 — Public website

| ID | Milestone | State |
| --- | --- | --- |
| 2.1 | Sitemap and robots for the public catalogue | Complete |
| 2.2 | English and Hindi route shell, language switcher, and persisted preference | Complete |
| 2.3 | Hindi and English fields for categories and products, without duplicating rows | Complete |
| 2.4 | Localized navigation, buttons, validation, and SEO metadata | Complete |

The homepage, catalogue, product details, filters, WhatsApp enquiry, and contact details already exist and stay as they are.

## Phase 3 — Public catalogue API

The unversioned category, product, enquiry, and settings handlers already exist. Remaining work:

| ID | Milestone | State |
| --- | --- | --- |
| 3.1 | Add `/api/v1` aliases that return the same JSON | Complete |
| 3.2 | Plan the enquiry status expansion. Do not migrate existing rows until the mapping is reviewed | Complete |

## Phase 4 — Admin access

| ID | Milestone | State |
| --- | --- | --- |
| 4.1 | Session authentication, password hashing, and owner role | Complete |
| 4.2 | Permission checks on the server and an audit log for admin writes | Complete |
| 4.3 | `/admin/login` and an empty dashboard that shows only real counts | Complete |

No admin registration page will be public.

## Phase 5 — Catalogue management

| ID | Milestone | State |
| --- | --- | --- |
| 5.1 | Staff category and product editing. Cost and wholesale prices stay off the public API | Complete |
| 5.2 | Product images chosen from a computer | Complete |
| 5.3 | Cloudinary image hosting | Pending |

Staff can choose a category or product image from a computer. The file is stored on this server. They can still paste an image address, choose the primary image, reorder images, and remove an image. Cloudinary hosting waits for credentials.

## Phase 6 — Purchasing and suppliers

| ID | Milestone | State |
| --- | --- | --- |
| 6.1 | Supplier records for signed-in staff. No purchases, stock, or payments | Complete |
| 6.2 | Purchase orders, goods receipts, and stock updates in one transaction | Complete |

## Phase 7 — Sales and customers

| 7.1 | Customer types, sales orders, stock reservation, and dispatch. No prices, invoices, or payments | Complete |

## Phase 8 — Quotations and invoices

| 8.1 | Quotation PDF, revisions, invoice numbers from a database sequence, and no silent edits after a document is issued | Complete |

## Phase 9 — Accounting

Double-entry journal, receivables, payables, and reports. GST fields are stored, then checked with an accountant before anyone calls them compliant.

## Phase 10 — Reports

Dashboard figures come from posted transactions. Empty states stay empty when the database has no sales.

## Phase 11 — Security, tests, and deployment

Playwright coverage for the public browse flow and admin login, security headers, and a Vercel production deploy. Demo seed data is not applied automatically to production.

## Phase 12 — Mobile preparation

Keep `/api/v1` stable for a future Kotlin Compose Multiplatform app. Do not create the mobile application in this repository.
