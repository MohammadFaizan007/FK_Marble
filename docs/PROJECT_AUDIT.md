# FK Marble project audit

Audit date: 10 November 2026. This file records what is already in the repository. It does not replace `docs/MASTER_BLUEPRINT.md`.

No database credentials are included.

## Existing implementation

The application is a Next.js 16.4.5 App Router project in TypeScript, React 19, and Tailwind CSS 4. The package name is `fk-marble`.

Working public website:

- Homepage with hero, six category cards, featured products, about, why-choose, wholesale and retail, gallery, contact, and footer.
- Navigation: Home, Collections, About Us, Gallery, Contact Us, and WhatsApp.
- `/products` with search, category, material, color, finish, and size filters, sorting, pagination, and empty states.
- `/categories/[slug]` for tiles, marble, granite, kota-stone, sandstone, and natural-stone. `other-natural-stone` redirects to `natural-stone`.
- `/products/[slug]` with gallery, specifications, related products, and an enquiry form that also opens WhatsApp.
- Branded not-found page.
- Business facts in `src/config/site.ts`: FK Marble, STONE & SURFACES, 177 ITI Chauraha, Etawah, phone and WhatsApp 9045760027, hours 9:00 AM to 8:00 PM.

Working backend:

- Prisma 7 schema and the initial migration.
- Neon project linked in `.neon`. `neon deploy` wrote the pooled and direct Postgres URLs into `.env.local`.
- Server-only Prisma client using `pg` and `@prisma/adapter-pg`.
- Public REST routes for categories, products, enquiries, and settings.
- Zod validation, a shared JSON envelope, and an in-memory enquiry rate limit.
- Seed for six categories, business settings, and demo products marked `isDemo: true`.

## Working functionality verified on 10 November 2026

A read-only connectivity check succeeded. `SELECT 1` returned a row. Counts, with no credentials printed:

| Record | Count |
| --- | --- |
| Categories | 6 |
| Real active products | 0 |
| Demo products | 13 |
| Business settings | 1 |
| Enquiries | 2 |

The two enquiries are earlier development checks, not showroom customers. Demo products stay out of the public catalogue.

## Incomplete functionality

Compared with the master blueprint, these modules are not built:

- Hindi and English routes, language switcher, and stored Hindi catalogue copy.
- Admin login, roles, permissions, and every `/admin` screen.
- Users, sessions, price lists, variants, warehouses, slabs, stock ledger, purchases, suppliers, sales, customers, quotations, invoices, payments, accounting, notifications, and audit logs.
- Cloudinary uploads. The image model only reserves `cloudinaryPublicId`.
- Versioned `/api/v1` aliases.
- Vitest and Playwright. Tests currently use Node's built-in test runner.
- React Hook Form. It is specified for later forms and is not installed.
- Production deployment to Vercel.

The public catalogue API from the earlier database step is in place. The larger ERP schema is not.

## Errors

No failing test or build was open at the start of this audit. `npx prisma validate` and `npx prisma generate` had already succeeded. The root `.env` file is absent. Prisma reports zero variables from `.env` and reads the Neon URL from `.env.local`.

## Technical debt

- Enquiry statuses in the database are `PENDING`, `CONTACTED`, `COMPLETED`, and `CANCELLED`. The blueprint's later enquiry workflow uses New, Contacted, Quoted, Converted, Closed, and Cancelled. Existing rows must not be rewritten until that milestone has an explicit migration.
- The identity table is `AdminUser`. The blueprint's later model is `User` plus roles and permissions. `AdminUser` stays until authentication is designed.
- The enquiry rate limit lives in process memory and resets when the server restarts.
- `metadataBase` is unset, so Open Graph URLs fall back to localhost until `NEXT_PUBLIC_SITE_URL` is a real public origin.
- Git still shows the original `app/` directory as deleted and `src/` as untracked. The running application is `src/app`.

## Missing dependencies for later phases

Not installed, and not added in this milestone: React Hook Form, Cloudinary SDK, Vitest, Playwright, and an i18n library. They will be added when their milestone starts.

## Database status

- Provider: PostgreSQL on Neon, database name `neondb`.
- Migration `20261106103000_init` has been applied.
- Seed has been applied.
- No destructive migration is planned in the current milestone.

## Recommended corrections

1. Keep the public site and the current Prisma models. Do not replace them with the full ERP schema in one migration.
2. Finish the public website gaps before admin ERP work. The first gap implemented after this audit is the sitemap and robots file.
3. Add Hindi and English as the next public milestone, without duplicating product rows.
4. Introduce authentication and roles before any admin CRUD API.
5. Keep demo rows labeled and excluded from public queries.
