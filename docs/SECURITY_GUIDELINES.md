# FK Marble security guidelines

These rules apply from the current public site through the later admin ERP.

## Secrets

- Database URLs, Cloudinary secrets, and session secrets stay in `.env.local` or the host's environment.
- Do not commit `.env`, `.env.local`, or `.neon`.
- Do not print connection strings in logs, docs, or test output.
- Do not prefix a secret with `NEXT_PUBLIC_`.
- Do not turn off SSL verification. The app rewrites `sslmode=require` to `sslmode=verify-full` for the `pg` pool.

## Public surface

- Public routes may read active, non-demo products and public business settings. They do not return cost or wholesale prices.
- Public routes must not create, edit, or delete products.
- Enquiry handlers validate the body with Zod, limit repeats from one address, and do not trust a client-supplied price.
- `/robots.txt` disallows `/admin` and `/api`.

## Authentication

- Passwords are stored with scrypt. The plain password is never stored.
- There is no public admin registration page. The first owner is created with `npm run admin:create-owner`.
- The session cookie is `HttpOnly` and `SameSite=Lax`. The database stores a hash of the token. Logout sets `revokedAt`.
- Sign-in attempts are limited to 5 per address in 15 minutes, in memory for one server process.
- Every admin write goes through `withAdminWrite`. The server checks the signed-in role before the write. Hiding a button is not enough.
- The owner holds every permission. An administrator can operate the business and cannot grant access. A role can grant a permission only when it holds both `user.manage` and that permission.
- Sign-in, sign-out, owner creation, and other admin writes insert an `AuditLog` row in the same database transaction. The row stores the actor, action, entity, and a short summary. It does not store passwords, session tokens, or request bodies.

## Data

- Prisma parameterizes queries. Do not assemble SQL from request text.
- Financial totals are calculated on the server.
- Posted invoices and journal entries are reversed, not silently deleted.
- Customer enquiry rows are not rendered on a public page.

## Uploads

- Category images are accepted only from a signed-in role that can create or update products.
- Accept JPG, PNG, and WebP, and reject anything over 5 MB. The stored name is generated. The browser's file name is not used.
- A category image chosen from a computer is stored under `public/uploads/categories`. Replacing it removes the previous stored file. A product image chosen from a computer is stored under `public/uploads/products`, and removing it deletes that file. Seeded reference photos are not deleted.
- Cloudinary is not configured. When it is added, store the Cloudinary public id for those managed uploads.
- Hindi catalogue translation is available only to a signed-in role that can create or update products. The English catalogue text is sent to the translation service. Passwords, prices, and customer enquiries are not sent.
- Supplier records are available only to a signed-in role with supplier access. The public site has no supplier route.
- Purchase orders and goods receipts are available only to a signed-in role that can create or approve purchases. Stock quantities from those receipts are not returned by the public product API.
- Customer records and sales orders are available only to a signed-in role that can create or approve sales. The public site has no customer route. Dispatch quantities are not returned by the public product API.
- Quotations and invoices are available only to a signed-in role that can create sales, approve sales, or issue invoices. The public site has no quotation or invoice route. The PDF shows the offered rate and does not include cost or wholesale prices. An issued invoice is cancelled in place. Its number is not deleted or reused.
