# FK Marble

Website for FK Marble, a wholesale and retail supplier of tiles and natural stone at 177, ITI Chauraha, Etawah, Uttar Pradesh.

## Prerequisites

- Node.js 20.9 or later (this project is developed on Node.js 24)
- npm
- PostgreSQL 14 or later. This project is linked to Lakebase Postgres on Neon.

## Setup

```bash
npm install
copy .env.example .env
```

The app reads `DATABASE_URL` from `.env.local` when that file exists, and from `.env` otherwise. `neon deploy` writes the pooled `DATABASE_URL` and the direct `DATABASE_URL_UNPOOLED` into `.env.local`. Do not commit either file. The value in `.env.example` is a placeholder.

Create an empty database named `fk_marble` (the name can differ if the URL matches), then apply the schema and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### PostgreSQL

Local installation: install PostgreSQL, create a user and a database, and put that user's connection string in `DATABASE_URL`. A typical local URL looks like `postgresql://postgres:your-password@localhost:5432/fk_marble?schema=public`.

Neon: the linked project is `purple-fog-14956487`, branch `production`. `DATABASE_URL` is the pooled connection used by the running app. `DATABASE_URL_UNPOOLED` is the direct connection used by `prisma migrate deploy`. Sign in with `neon login` before `neon deploy` or `neon env pull`.

Until `DATABASE_URL` is set, the catalogue pages show a setup message. They do not pretend that sample records are live stock.

### Database commands

| Command | Purpose |
| --- | --- |
| `npx prisma validate` | Check `prisma/schema.prisma` |
| `npx prisma generate` | Generate the Prisma Client |
| `npx prisma migrate deploy` | Apply committed migrations |
| `npx prisma db seed` | Insert categories, business settings, and demo products |
| `npm test` | Run validation tests. Database tests run only when `DATABASE_URL` is configured |

The seed can be run more than once. Demo products are marked `isDemo` and are omitted from the public catalogue and public APIs.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma Client and create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui (`base-nova` style)
- Lakebase Postgres on Neon
- Prisma ORM 7 with the `pg` driver
- Zod

Auth.js and Cloudinary are not configured yet. Do not add credentials to the repository.

Public HTTP APIs are documented in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Troubleshooting

- `PostgreSQL is not configured`: `.env.local` and `.env` are missing, or `DATABASE_URL` is still the placeholder from `.env.example`.
- `The catalogue database could not be reached`: PostgreSQL is not running, the database does not exist, or the user in `DATABASE_URL` cannot connect. The server log records the error name, not the connection string.
- `prisma migrate deploy` asks for `DATABASE_URL`: the variable is only read on the server. Set it in `.env` before running Prisma commands.
- Catalogue pages are empty after a successful seed: that is expected. Seeded products are development samples and are excluded from the public site.
- Enquiry form opens WhatsApp but says the enquiry was not stored: the database was unavailable. The WhatsApp message is still sent to the showroom number.

Brand colors, type, and logo usage are documented in [docs/BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md).

## Project structure

Application routes stay in `src/app`. Shared code lives beside it and is imported with the `@/` alias, which points at `src/`.

```text
src/app/                  Routes, layouts, and global styles
src/components/layout/    Header, footer, and navigation
src/components/common/    Shared UI that is not a shadcn primitive
src/components/ui/        shadcn/ui components
src/features/products/    Product types and product-specific logic
src/features/categories/  Category lookups
src/features/enquiries/   Enquiry form types
src/config/site.ts        Business name, address, contact, hours, categories
src/lib/utils.ts          Class name helper used by UI components
src/services/             Database, auth, and media integrations
src/types/                Shared types
```

Business details used across the site come from `src/config/site.ts`. Do not copy the address, phone number, or hours into components.

## UI components

Add a shadcn/ui component when a screen needs it:

```bash
npx shadcn@latest add button
```

`components.json` already points at `src/app/globals.css` and `@/components/ui`.

## Conventions

- Keep route files in `src/app` and keep feature logic in `src/features`.
- Put reusable visual primitives from shadcn/ui in `src/components/ui`.
- Put shell components in `src/components/layout` and other shared components in `src/components/common`.
- Call external systems from `src/services`, not from page components.
- Prefer the `font-sans` and color tokens in `src/app/globals.css` over one-off colors.
- Dark mode follows the system preference. A `.dark` class is also supported for a later theme toggle.
