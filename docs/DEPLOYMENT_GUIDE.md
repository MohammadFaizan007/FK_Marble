# FK Marble deployment guide

Production hosting in the blueprint is Vercel for the app, Neon for PostgreSQL, and Cloudinary for later image uploads. The app is not deployed yet.

## Environments

| Environment | Database | Seed |
| --- | --- | --- |
| Local development | Neon branch pinned in `.neon`, currently `production` | Manual, via `npx prisma db seed` |
| Preview | A separate Neon branch | Do not load demo products automatically |
| Production | A separate Neon branch or project | Do not run the demo seed automatically |

The current local link points at the Neon branch named `production`. Treat that as the development database until a separate production branch is created. Do not put real customer sales into it.

## Release steps, when deployment is approved

1. Confirm `NEXT_PUBLIC_SITE_URL` is the public HTTPS origin.
2. Set `DATABASE_URL` to the pooled URL and `DATABASE_URL_UNPOOLED` to the direct URL in the host.
3. Run `npx prisma migrate deploy` with the direct URL.
4. Do not run `prisma db seed` against production.
5. Run `npm run build`.
6. Confirm `/`, `/products`, `/sitemap.xml`, and `/robots.txt` respond.
7. Confirm `/api/products` returns no demo rows.

## Backup

Neon retains point-in-time history according to the project plan. Before a migration that changes or removes columns, confirm a restore point exists and get explicit approval. This milestone does not change the schema.

## Restore outline

1. Create a Neon branch from the restore timestamp.
2. Point a non-production environment at that branch.
3. Confirm row counts for categories, products, and enquiries.
4. Only then decide whether to restore the original branch.

Do not run `prisma migrate reset` against a database that holds enquiries or future financial documents.
