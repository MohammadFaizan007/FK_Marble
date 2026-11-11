# Enquiry status plan

Written 10 November 2026 for milestone 3.2. The live database enum is unchanged. No rows were rewritten.

## What exists today

`EnquiryStatus` in `prisma/schema.prisma` is `PENDING`, `CONTACTED`, `COMPLETED`, and `CANCELLED`. New website enquiries are stored as `PENDING`. The public create response returns that same value. `/api/enquiries` and `/api/v1/enquiries` share one handler.

On 10 November 2026 the only stored status was `PENDING`, with 8 rows. `CONTACTED`, `COMPLETED`, and `CANCELLED` had no rows. The integration test inserts another `PENDING` enquiry each time it runs, so the count will be higher before any migration. Recount immediately before migrating. Do not print customer names, phone numbers, or messages while counting.

## Target workflow

The blueprint enquiry statuses are New, Contacted, Quoted, Converted, Closed, and Cancelled. Stored values stay uppercase, matching the current enum style:

| Future value | Meaning |
| --- | --- |
| `NEW` | Received. Nobody has acted yet. |
| `CONTACTED` | The showroom has spoken with the customer. |
| `QUOTED` | A quotation exists for this enquiry. |
| `CONVERTED` | The enquiry became a sales order. |
| `CLOSED` | Finished without a sale, or the sale is complete and no further enquiry work remains. |
| `CANCELLED` | The customer or the showroom stopped the enquiry. |

`QUOTED` and `CONVERTED` wait until quotations and sales orders exist. This plan does not add those tables.

## Mapping from the current enum

| Current value | Future value | Rule |
| --- | --- | --- |
| `PENDING` | `NEW` | Same meaning. Rename the enum value. |
| `CONTACTED` | `CONTACTED` | Leave the value and its rows unchanged. |
| `CANCELLED` | `CANCELLED` | Leave the value and its rows unchanged. |
| `COMPLETED` | `CLOSED` | Rename the enum value only when a recount shows zero `COMPLETED` rows. |

`COMPLETED` is not mapped to `CONVERTED`. Nothing in the database records a quotation or a sales order, so a completed enquiry cannot be proven to be a sale. If the recount finds any `COMPLETED` row, stop. Review that row with the showroom before choosing `CLOSED` or `CONVERTED`.

`QUOTED` and `CONVERTED` are new values. No current row moves into them.

## Migration to run later

Run this only after a fresh count and an explicit decision to migrate. Keep it in its own migration. Do not combine it with admin or sales work.

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Enquiry" WHERE status = 'COMPLETED') THEN
    RAISE EXCEPTION 'COMPLETED enquiries need a reviewed mapping before this migration';
  END IF;
END $$;

ALTER TYPE "EnquiryStatus" RENAME VALUE 'PENDING' TO 'NEW';
ALTER TYPE "EnquiryStatus" RENAME VALUE 'COMPLETED' TO 'CLOSED';
ALTER TYPE "EnquiryStatus" ADD VALUE 'QUOTED';
ALTER TYPE "EnquiryStatus" ADD VALUE 'CONVERTED';
```

PostgreSQL cannot use a newly added enum value in the same transaction that adds it. This statement only renames and adds values, so it can stay in one migration. If the migration tool rejects `ADD VALUE` inside its transaction, split the two `ADD VALUE` statements into a following migration.

After that migration, the Prisma default becomes `NEW`, and both public enquiry routes return `status: "NEW"` for a newly saved enquiry. Change `/api` and `/api/v1` together. Until the migration, they keep returning `PENDING`.

The public request still cannot set a status, a price, or a total.

## Later status changes

Staff status changes belong to the admin milestone, after login exists. Allowed moves:

- `NEW` to `CONTACTED`, `QUOTED`, or `CANCELLED`
- `CONTACTED` to `QUOTED`, `CLOSED`, or `CANCELLED`
- `QUOTED` to `CONVERTED`, `CLOSED`, or `CANCELLED`
- `CONVERTED` to `CLOSED`
- `CLOSED` and `CANCELLED` stay as they are

`QUOTED` requires a quotation record. `CONVERTED` requires a sales order. Those checks arrive with those modules.

Source, assigned staff, follow-up date, and multiple enquiry items are blueprint fields. They are separate additive columns or tables, not part of the status rename.
