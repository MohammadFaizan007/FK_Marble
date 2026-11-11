# FK Marble architecture

The master specification is `docs/MASTER_BLUEPRINT.md`. This file describes the architecture that exists today and the boundary for later modules.

## Shape

FK Marble is one Next.js application. The public website, route handlers, and database access live in the same repository. There are no microservices.

```text
Browser
  -> src/app pages and route handlers
    -> src/services
      -> src/lib/prisma.ts
        -> Neon PostgreSQL
```

React components do not import Prisma. `src/services/product-service.ts` is the catalogue and enquiry boundary.

## Runtime

- Next.js 16 App Router with `cacheComponents` enabled.
- Pages that read the database call `connection()` inside `<Suspense>` so the static shell can still prerender.
- The Prisma client is a singleton on `globalThis` so development reload does not open a new pool on every save.
- Application queries use the pooled `DATABASE_URL`.
- `prisma migrate deploy` uses `DATABASE_URL_UNPOOLED` when it is set.

## Folders

| Path | Responsibility |
| --- | --- |
| `src/app` | Pages, layouts, sitemap, robots, and route handlers |
| `src/components` | Presentation. Client components only where the page needs interaction |
| `src/config` | Showroom facts, navigation, category copy, and demo product samples |
| `src/types` | Shared TypeScript shapes |
| `src/services` | Database reads and writes for the public catalogue |
| `src/lib` | Prisma, validation, API envelopes, WhatsApp links, and public URLs |
| `prisma` | Schema, migration, and seed |
| `docs` | Permanent project documents |

`@/` maps to `src/`.

## Public routes

| Route | Rendering |
| --- | --- |
| `/` | Server page. Featured products load inside Suspense |
| `/products` | Server page plus the client `ProductBrowser` |
| `/categories/[slug]` | Server page. Unknown slugs call `notFound()` |
| `/products/[slug]` | Server page |
| `/en` and `/hi` | The same public pages with a language prefix |
| `/sitemap.xml` | Generated from the public catalogue paths |
| `/robots.txt` | Allows the site and blocks `/admin` and `/api` |

`src/proxy.ts` redirects an unprefixed public page to `/en` or `/hi` only after the visitor has chosen a language. Navigation links keep the prefix that is already in the address bar. Product rows are not copied per language.

## API

`src/app/api/v1` re-exports the handlers in `src/app/api`. Both addresses return the same JSON. Staff sign-in lives at `/api/admin` and `/api/v1/admin`. See `docs/API_DOCUMENTATION.md`.

Success responses use `{ success, message, data, meta }`. Errors use `{ success, message, errors }`.

## Data rules already in force

- Public product queries require `isActive: true` and `isDemo: false`.
- A hidden price is returned as `null`.
- Money uses Prisma `Decimal`.
- Enquiry creation checks the Indian mobile number and ignores any client-supplied price.
- No public route creates, edits, or deletes products.

## Later modules

Staff permissions and the audit log live in `src/lib/permissions.ts`, `src/lib/admin-guard.ts`, and `src/lib/audit-log.ts`. Inventory, purchasing, sales, and accounting will be added as services beside `product-service.ts`. They will not be imported into client components. Financial and stock changes will use database transactions and `withAdminWrite`. Admin pages live under `/admin` and use their own layout. The public header, footer, and WhatsApp button stay in the showroom route group.
