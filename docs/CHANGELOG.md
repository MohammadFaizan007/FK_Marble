# Changelog

## 2026-11-11 — supplier records

- Signed-in staff who can update suppliers can save a supplier name, contact, phone, email, address, GSTIN, and notes.
- The dashboard counts suppliers on file. Purchases, stock, payments, and balances are not recorded.

## 2026-11-10 — product images from a computer

- Signed-in staff can choose a product image from a computer. The file is stored on this server.
- Removing that image deletes the stored file. An image address can still be pasted when the file is already on the web.
- Cloudinary hosting remains pending until credentials are added.

## 2026-11-10 — Hindi filled from English catalogue text

- Category and product forms fill the Hindi fields when the English text changes.
- Saving a blank Hindi field stores the Hindi translation. The Hindi pages show that saved text.
- Size and thickness stay as measurements.

## 2026-11-10 — category images from a computer

- The homepage collections and the footer list read active categories from the database.
- Signed-in staff can choose a JPG, PNG, or WebP category image from their computer. The file is stored on this server.
- A later seed run keeps a category image that was uploaded this way.

## 2026-11-10 — staff catalogue editing

- Signed-in staff can edit categories and products from the admin pages.
- Products can store a retail price, a wholesale price, and a cost price. The public API still returns only a retail price when that product is set to show it.
- Staff can attach an image address, choose a primary image, reorder images, and remove an image.

## 2026-11-10 — admin login and dashboard

- Added `/admin/login` and a dashboard for signed-in staff.
- The dashboard counts categories, public products, demo samples, enquiries, and staff from the database.
- The public header and footer stay on the showroom pages. Admin pages use a separate layout.

## 2026-11-10 — admin permissions and audit log

- Added server-side permission checks. The owner holds every permission, and only a role with `user.manage` can grant a permission it already holds.
- Added an `AuditLog` table. Sign-in, sign-out, and owner creation write a row in the same transaction as the change.

## 2026-11-10 — staff sign-in

- Added scrypt password hashes, revocable admin sessions, and the owner role.
- Added sign-in, session, and sign-out endpoints. There is no public registration page.
- The first owner is created only by `npm run admin:create-owner` with local environment variables.

## 2026-11-10 — enquiry status plan

- Recorded how `PENDING`, `CONTACTED`, `COMPLETED`, and `CANCELLED` map to the later enquiry workflow.
- Left the database enum and existing rows unchanged.

## 2026-11-10 — versioned public API

- Added `/api/v1` aliases for categories, products, enquiries, and settings.
- Each alias calls the existing handler, so the JSON stays the same.

## 2026-11-10 — localized chrome and SEO

- Navigation, buttons, enquiry labels, and validation messages follow `/en` or `/hi`.
- Public pages advertise English and Hindi URLs, and the sitemap lists both.
- An enquiry can send `locale` so validation messages match the page. The value is not stored.

## 2026-11-10 — stored Hindi catalogue copy

- Added optional Hindi columns on the existing category and product rows.
- `/hi` category cards, collection headings, and product text use that stored copy. English remains the API `name` and `description`.
- Navigation, buttons, validation, and SEO stay English.

## 2026-11-10 — language shell

- Added `/en` and `/hi` routes that reuse the existing pages.
- Added an English / हिन्दी switcher. The choice is stored in the `fk-marble-locale` cookie, and later visits to an unprefixed public page open the saved language.
- The original `/`, `/products`, and category URLs remain for visitors who have not chosen a language.

## 2026-11-10

- Recorded the repository audit and the permanent project documents.
- Confirmed the Neon database responds and counted existing rows without printing credentials.
- Added `/sitemap.xml` and `/robots.txt` for the public catalogue. Demo product URLs are not listed.

## Earlier development

- Next.js app, FK Marble branding, homepage, category pages, product catalogue, and product details.
- Prisma schema, initial migration, seed, and public catalogue APIs.
- Neon link for Postgres. Connection variables are stored in `.env.local`.
