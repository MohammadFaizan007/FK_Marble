# Known issues

- The root `.env` file does not exist. Neon connection variables are in `.env.local`. Prisma reports `injected env (0) from .env`.
- `NEXT_PUBLIC_SITE_URL` is empty, so the sitemap and Open Graph metadata use `http://localhost:3000` until a public origin is set.
- The public catalogue has no real products. Thirteen demo products exist and are hidden. The homepage shows an empty featured state.
- Enquiry rows exist from development checks. `tests/database.integration.test.ts` inserts another retail enquiry each time the database suite runs.
- Enquiry statuses stay `PENDING`, `CONTACTED`, `COMPLETED`, and `CANCELLED`. The reviewed mapping to New, Contacted, Quoted, Converted, Closed, and Cancelled is in `docs/ENQUIRY_STATUS_PLAN.md`. Existing rows have not been migrated.
- Homepage marketing sections such as the hero headline, about text, and gallery captions stay English. Navigation, buttons, enquiry validation, and SEO metadata follow the selected language.
- Catalogue Hindi is filled from the English text through a translation service. Staff can correct the Hindi field before saving. A saved Hindi value stays until the English field changes and the form is saved again.
- `<html lang>` starts as `en-IN` and is updated in the browser after a localized page loads.
- A new environment still creates the first owner with `npm run admin:create-owner`. The owner created before the audit log has no creation row.
- The dashboard does not yet show sales, purchases, stock value, or profit. Those figures wait until the records exist.
- Category and product images can be chosen from a computer and are stored under `public/uploads`. Cloudinary hosting is not configured. The six category cards still show the original reference photos until a staff member replaces them.
- Accounting, payments, and tax invoices are not implemented. Quotations and invoices record the offered rate only.
- The enquiry rate limit is stored in memory for a single server process.
- Vitest and Playwright are not installed. The current suite uses `node --test`.
- Git has not been asked to commit this work. `src/` is still untracked and the original root `app/` directory is deleted in the working tree.
