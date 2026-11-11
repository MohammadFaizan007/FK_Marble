# FK Marble testing guidelines

## Current runner

The project uses Node's built-in test runner:

```bash
npm test
```

Database tests in `tests/database.integration.test.ts` run only when `DATABASE_URL` is a real Postgres URL. They must not be described as passed when they are skipped.

A production check is:

```bash
npm run build
```

## What each kind of test covers

| Kind | Use it for |
| --- | --- |
| Unit | Price labels, tax, unit conversion, slab area, permissions, and journal balance, as those modules appear |
| Integration | Prisma reads and writes against Neon or a branch database |
| End-to-end | Browser flows. Playwright is planned and is not installed yet |
| Responsive | Mobile, tablet, and desktop on pages whose layout changed |

## Rules

- Run the tests for the milestone before marking it complete.
- Do not claim a browser flow passed without exercising it.
- Do not print credentials from a test.
- Demo product slugs must stay absent from public query results.
- New financial tests must show that debits equal credits.
- Do not insert fake stock, prices, or customers to make a dashboard look populated.

## Milestone 2.1 coverage

`tests/public-routes.test.ts` checks the public path list used by the sitemap. It expects the six category routes, including `natural-stone`, and it rejects demo product URLs.
