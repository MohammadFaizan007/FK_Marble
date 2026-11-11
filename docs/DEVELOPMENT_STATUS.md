# FK Marble development status

Last updated: 11 November 2026, after quotations and invoices.

Read `docs/MASTER_BLUEPRINT.md`, this file, `docs/PROJECT_AUDIT.md`, and `docs/ARCHITECTURE.md` before continuing in a new session.

## Current phase

Phase 8 — Quotations and invoices. A quotation stores the rate offered to the customer, keeps each revision, and can be downloaded as a PDF. An invoice number comes from a database sequence when the invoice is issued. An issued invoice cannot be edited or deleted. Tax, payments, and accounting are not recorded. Cloudinary hosting remains pending until credentials are added.

## Completed modules

- Project setup, branding, homepage, catalogue, category pages, and product details.
- WhatsApp links and the public enquiry form.
- Prisma schema, migration `20261106103000_init`, and idempotent seed.
- Public APIs for categories, products, enquiries, and settings.
- Neon Postgres connectivity.
- Permanent project documentation.
- Public sitemap and robots file.
- English and Hindi route shells at `/en` and `/hi`, with a language switcher and a saved `fk-marble-locale` cookie.
- Hindi and English category and product copy on the same rows. `/hi` shows the stored Hindi catalogue text.
- Localized navigation, buttons, enquiry validation, and SEO metadata for `/en` and `/hi`.
- `/api/v1` aliases for categories, products, enquiries, and settings. They use the existing handlers.
- Enquiry status mapping in `docs/ENQUIRY_STATUS_PLAN.md`. The live enum is still `PENDING`, `CONTACTED`, `COMPLETED`, and `CANCELLED`.
- Staff sign-in with scrypt password hashes, revocable sessions, and the owner role. No public registration page.
- Server-side permission checks and an audit log for admin writes.
- `/admin/login` and a dashboard that shows only database counts. Stock value and profit are not shown.
- Staff category and product editing. Cost and wholesale prices are stored for staff and left out of the public API.
- Category cards and the footer collections list read active categories from the database. Signed-in staff can replace a category image with a JPG, PNG, or WebP chosen on their computer.
- Category and product forms fill Hindi from the English details. The Hindi site uses the saved Hindi text.
- Signed-in staff can choose a product image from a computer. The file is stored on this server. Removing that image deletes the stored file.
- Signed-in purchase staff can save supplier name, contact, phone, email, address, GSTIN, and notes.
- Signed-in sales staff can save a customer and the customer type. Opening balances and credit limits are not stored.
- Signed-in sales staff can draft a sales order. An owner or administrator approves it. Reserving goods holds free stock, and dispatch reduces the quantity on hand in the same step. Prices stay off the sales order. Demo samples cannot be ordered.
- Signed-in sales staff can draft a quotation with a customer rate, revise a sent quotation, and download a PDF. An accepted quotation can become a draft sales order. The sales order keeps quantities only.
- A draft invoice can be issued by a role with `invoice.issue`. The number comes from `invoice_number_seq` and is not reused. Cancelling an issued invoice keeps the number and the row.

## In progress

None.

## Pending modules

- Milestone 5.3: Cloudinary image hosting, after credentials are added.
- Phase 9: accounting. Do not show cost or wholesale prices on the public site, and do not migrate enquiry statuses.

## Files created in milestone 1.1 and 2.1

- `docs/PROJECT_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_DESIGN.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/SECURITY_GUIDELINES.md`
- `docs/TESTING_GUIDELINES.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/CHANGELOG.md`
- `docs/KNOWN_ISSUES.md`
- `docs/DEVELOPMENT_STATUS.md`
- `src/lib/public-routes.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `tests/public-routes.test.ts`

## Files created for milestone 2.2

- `src/i18n/locale.ts`
- `src/proxy.ts`
- `src/app/[lang]/layout.tsx`
- `src/app/[lang]/page.tsx`
- `src/app/[lang]/products/page.tsx`
- `src/app/[lang]/products/[slug]/page.tsx`
- `src/app/[lang]/categories/[slug]/page.tsx`
- `src/components/common/LocaleLink.tsx`
- `src/components/common/LanguageSwitcher.tsx`
- `src/components/common/HtmlLang.tsx`
- `tests/locale.test.ts`

## Files modified for milestone 2.2

- `src/app/layout.tsx` — Devanagari font variable for Hindi text.
- `src/components/layout/Header.tsx` and `Footer.tsx` — language switcher and locale-aware links.
- `src/components/home/HeroSection.tsx`, `CategorySection.tsx`, `ProductCard.tsx`, `Breadcrumbs.tsx`, `not-found.tsx`, and the product detail category link.
- `src/app/categories/[slug]/page.tsx` — the natural-stone alias keeps the active language.
- `package.json` — the test script includes `tests/locale.test.ts`.

`docs/MASTER_BLUEPRINT.md` was left unchanged.

## Files created for milestone 2.3

- `src/i18n/copy.ts`
- `src/components/layout/FooterCollections.tsx`
- `prisma/migrations/20261110123000_bilingual_catalogue_copy/migration.sql`
- `tests/catalogue-copy.test.ts`

## Files modified for milestone 2.3

- `prisma/schema.prisma` and `prisma/seed.ts` — optional Hindi columns and stored sample translations.
- `src/config/categories.ts`, `src/services/catalogue-mapper.ts`, and `src/services/product-service.ts` — pages choose the stored language.
- `src/types/api.ts` — English fields stay, and optional Hindi fields are added.
- Category, product, and home pages pass the route language into the catalogue.
- `src/app/globals.css` — Devanagari remains available when a heading contains Hindi.

## Database changes for milestone 2.3

Migration `20261110123000_bilingual_catalogue_copy` adds nullable Hindi columns. Existing English values were not rewritten. The seed writes Hindi onto the same category and demo product rows.

## Database changes for milestone 4.1

Migration `20261110140000_admin_role_and_sessions` adds `AdminUser.role` and the `AdminSession` table. No staff account is seeded.

## Database changes for milestone 4.2

Migration `20261110153000_admin_audit_log` adds the `AuditLog` table. Existing staff rows are unchanged. The owner created before this migration has no creation audit row.

## Database changes for milestone 5.1

Migration `20261110170000_product_staff_prices` adds nullable `wholesalePrice` and `costPrice` columns. Existing prices were not rewritten.

## Tests executed

`npm test` for milestone 5.1: 44 passed, 0 failed, 0 skipped. A temporary product with a cost price and a wholesale price stays out of the public catalogue.

`npm run build`: succeeded. Admin category and product pages are registered.

## Build status

Passed on 10 November 2026 for milestone 5.1.

## Known issues

See `docs/KNOWN_ISSUES.md`.

## Files created for milestone 2.4

- `src/i18n/chrome.ts`
- `src/i18n/use-chrome.ts`
- `src/i18n/metadata.ts`
- `src/components/common/SkipLink.tsx`
- `src/components/layout/FooterChrome.tsx`
- `tests/chrome.test.ts`

## Files modified for milestone 2.4

- Navigation, footer, hero and contact buttons, product filters, and the enquiry form read the route language.
- Enquiry validation accepts an optional `locale` and returns Hindi messages when it is `hi`.
- Page metadata and the sitemap advertise English and Hindi URLs.

## Files created for milestone 3.1

- `src/app/api/v1/categories/route.ts`
- `src/app/api/v1/categories/[slug]/route.ts`
- `src/app/api/v1/products/route.ts`
- `src/app/api/v1/products/[slug]/route.ts`
- `src/app/api/v1/enquiries/route.ts`
- `src/app/api/v1/settings/route.ts`
- `tests/api-v1.test.ts`

## Files created for milestone 3.2

- `docs/ENQUIRY_STATUS_PLAN.md`

## Files created for milestone 4.1

- `src/lib/password.ts`
- `src/lib/admin-session.ts`
- `src/lib/admin-auth.ts`
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`
- `src/app/api/admin/session/route.ts`
- `src/app/api/v1/admin/login/route.ts`
- `src/app/api/v1/admin/logout/route.ts`
- `src/app/api/v1/admin/session/route.ts`
- `scripts/create-owner.ts`
- `prisma/migrations/20261110140000_admin_role_and_sessions/migration.sql`
- `tests/admin-auth.test.ts`
- `tests/admin-session.integration.test.ts`

## Files created for milestone 4.2

- `src/lib/permissions.ts`
- `src/lib/audit-log.ts`
- `src/lib/admin-guard.ts`
- `prisma/migrations/20261110153000_admin_audit_log/migration.sql`
- `tests/admin-permissions.test.ts`
- `tests/admin-permissions.integration.test.ts`

## Files created for milestone 4.3

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/(showroom)/layout.tsx`
- `src/components/layout/ShowroomFrame.tsx`
- `src/components/admin/LoginForm.tsx`
- `src/components/admin/SignOutButton.tsx`
- `src/components/common/NotFoundView.tsx`
- `src/services/admin-dashboard.ts`
- `tests/admin-dashboard.integration.test.ts`

## Files created for milestone 5.1

- `src/services/admin-catalogue.ts`
- `src/lib/admin-catalogue-schema.ts`
- `src/lib/admin-page.ts`
- `src/lib/catalogue-http.ts`
- `src/components/admin/AdminBar.tsx`
- `src/components/admin/CatalogueForm.tsx`
- `src/components/admin/CategoryForm.tsx`
- `src/components/admin/ProductForm.tsx`
- `src/components/admin/ImageEditor.tsx`
- `src/app/admin/categories/page.tsx`
- `src/app/admin/categories/new/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/page.tsx`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/products/[id]/images/route.ts`
- `src/app/api/admin/products/[id]/images/[imageId]/route.ts`
- `prisma/migrations/20261110170000_product_staff_prices/migration.sql`
- `tests/admin-catalogue.test.ts`
- `tests/admin-catalogue.integration.test.ts`

## Next implementation task

Phase 9. Add accounting records. Do not show cost or wholesale prices on the public site, and do not migrate enquiry statuses. Cloudinary hosting stays pending until credentials are added. Do not claim GST compliance.
