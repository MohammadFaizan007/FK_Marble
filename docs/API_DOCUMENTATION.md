# FK Marble public API

Every catalogue path below also exists under `/api/v1` and runs the same handler. `/api/categories` and `/api/v1/categories` return the same JSON.

Staff sign-in is separate. `POST /api/admin/login` and `POST /api/v1/admin/login` accept `email` and `password`, set an `HttpOnly` session cookie, and return the staff id, name, email, and role. They do not create accounts. `GET /api/admin/session` returns the same profile, or `401` when the cookie is missing or revoked. `POST /api/admin/logout` revokes the session. The `/api/v1/admin` paths call those same handlers. A wrong email or password returns `401` with `Email or password is incorrect.` A signed-in role that lacks the required permission receives `403` with `You do not have permission for this action.` Successful sign-in and sign-out write an audit row. The JSON response does not include that row. Responses use ISO 8601 timestamps. Prices are decimal strings, never floating-point values. Demo products (`isDemo: true`) and inactive products are excluded.

`name`, `description`, and the other original text fields stay English. Categories and products also return stored Hindi in `nameHi`, `descriptionHi`, and, for products, `materialHi`, `finishHi`, `colorHi`, `usageHi`, and `availabilityHi`. A missing translation is `null`. The API does not choose a language from the request, and size and thickness stay as written.

No public endpoint creates, edits, or deletes products. A public product never includes `costPrice` or `wholesalePrice`. Staff catalogue routes under `/api/admin` and `/api/v1/admin` require a signed-in role, and the cost price is returned only to a role that can view cost. `DELETE /api/admin/products/[id]` removes a product for a role that can update products. A product that is already on a purchase order stays on file. `DELETE /api/admin/categories/[id]` removes a category for the same role. A category that still has products stays on file. `GET` and `POST /api/admin/customers`, and `PATCH` and `DELETE /api/admin/customers/[id]`, store a customer name, type, contact, phone, email, address, GSTIN, and notes for a role that can create sales. A customer that already has a sales order stays on file. They do not store a balance or a credit limit. `GET` and `POST /api/admin/sales` draft a quantity order. `POST /api/admin/sales/[id]/approve` is limited to a role that can approve sales. `POST /api/admin/sales/[id]/reservations` holds free stock. `POST /api/admin/sales/[id]/dispatches` writes the dispatch and the stock reduction in one transaction. These sales routes do not accept a price, invoice, or payment. `GET` and `POST /api/admin/quotations` store a customer rate for a role that can create sales. A quotation that has left draft stays on file, and a later change is a new revision. `GET /api/admin/quotations/[id]/pdf` downloads that quotation. `POST /api/admin/invoices` can copy an accepted quotation. `POST /api/admin/invoices/[id]/issue` assigns the next invoice number and is limited to a role that can issue invoices. An issued invoice is not edited or deleted. These documents are not on the public API and do not include cost or wholesale prices. `POST /api/admin/uploads` accepts one JPG, PNG, or WebP from a role that can create or update products. The form field `folder` is `categories` or `products`, and the response is the stored address. `POST /api/admin/translate` fills Hindi for the English catalogue fields and is limited to signed-in staff who can create or update products. `GET` and `POST /api/admin/suppliers`, and `PATCH` and `DELETE /api/admin/suppliers/[id]`, store supplier contact records for a role with supplier access. A supplier that already has a purchase order stays on file. They do not store balances. `GET` and `POST /api/admin/purchases` draft a quantity order. `POST /api/admin/purchases/[id]/approve` is limited to a role that can approve purchases. `POST /api/admin/purchases/[id]/receipts` writes the goods receipt and the stock movement in one transaction. These routes do not accept a cost, invoice, or payment. The same handlers are available under `/api/v1/admin`. Staff sign-in responses do not include permissions or audit rows.

## Response envelope

Success:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": [{ "field": "phone", "message": "Enter a valid Indian mobile number." }]
}
```

`errors` is an empty array when the failure is not tied to a field.

| Status | When |
| --- | --- |
| 200 | Read succeeded |
| 201 | Enquiry saved |
| 400 | Validation failed |
| 404 | Category, product, or settings row was not found |
| 429 | Too many enquiry requests from the same address |
| 503 | Database is not configured or cannot be reached |

## GET /api/categories

Authentication: none.

Returns active categories ordered by `displayOrder`. `productCount` counts active products that are not demo records.

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "cat-tiles",
      "name": "Tiles",
      "slug": "tiles",
      "description": "Floor and wall tiles for indoor and outdoor use.",
      "image": "/images/products/tiles-beige.png",
      "displayOrder": 1,
      "productCount": 0
    }
  ],
  "meta": { "total": 6 }
}
```

## GET /api/categories/{slug}

Authentication: none.

Slugs: `tiles`, `marble`, `granite`, `kota-stone`, `sandstone`, `natural-stone`.

Query parameters are the same as `GET /api/products`, except `category` is taken from the path.

```json
{
  "success": true,
  "message": "Category fetched successfully",
  "data": {
    "category": {
      "id": "cat-marble",
      "name": "Marble",
      "slug": "marble",
      "description": "Natural marble for floors, walls, and counters.",
      "image": "/images/products/marble-slab.png",
      "displayOrder": 2,
      "productCount": 0
    },
    "products": []
  },
  "meta": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
}
```

Unknown slug:

```json
{ "success": false, "message": "Category not found.", "errors": [] }
```

## GET /api/products

Authentication: none.

| Query | Default | Notes |
| --- | --- | --- |
| `page` | 1 | Integer, minimum 1 |
| `limit` | 12 | Integer, 1 to 48 |
| `search` | | Matches product name, material, or category name |
| `category` | | Category slug. `other-natural-stone` is accepted as `natural-stone` |
| `material` | | Comma-separated. Combined with the other filters |
| `color` | | Comma-separated |
| `finish` | | Comma-separated |
| `size` | | Comma-separated |
| `sortBy` | `createdAt` | `createdAt`, `name`, or `price` |
| `sortOrder` | `desc` | `asc` or `desc` |

Example: `/api/products?search=kota&material=Kota%20Limestone&color=Green&finish=Natural&size=600%20%C3%97%20600%20mm&sortBy=name&sortOrder=asc&page=1&limit=12`

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "prod-real-1",
      "name": "Polished Marble Slab",
      "slug": "polished-marble-slab",
      "description": "Description supplied by the showroom.",
      "material": "Marble",
      "size": "Slab",
      "thickness": "18 mm",
      "finish": "Polished",
      "color": "White",
      "usage": "Floors",
      "price": null,
      "priceUnit": null,
      "showPrice": false,
      "availability": "Confirm on enquiry",
      "isFeatured": false,
      "category": {
        "id": "cat-marble",
        "name": "Marble",
        "slug": "marble",
        "description": "Natural marble for floors, walls, and counters.",
        "image": "/images/products/marble-slab.png"
      },
      "images": [
        {
          "id": "img-1",
          "imageUrl": "/images/products/marble-slab.png",
          "altText": "Marble slab",
          "isPrimary": true,
          "displayOrder": 1
        }
      ],
      "primaryImage": {
        "id": "img-1",
        "imageUrl": "/images/products/marble-slab.png",
        "altText": "Marble slab",
        "isPrimary": true,
        "displayOrder": 1
      },
      "createdAt": "2026-03-18T09:00:00.000Z",
      "updatedAt": "2026-03-18T09:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 }
}
```

When `showPrice` is false, `price` and `priceUnit` are null even if a value is stored.

## GET /api/products/{slug}

Authentication: none.

Returns the product, its category, every image, and up to three related products from the same category. Unknown, inactive, and demo slugs return 404.

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "product": {},
    "relatedProducts": []
  },
  "meta": {}
}
```

`product` and each related product use the product object shown above.

## POST /api/enquiries

Authentication: none.

The server allows 5 requests from the same address in 10 minutes. That limit is in memory for a single server process.

```json
{
  "customerName": "Customer Name",
  "phone": "9045760027",
  "email": null,
  "productId": null,
  "productName": "Product Name",
  "enquiryType": "WHOLESALE",
  "quantity": 100,
  "quantityUnit": "SQ_FT",
  "message": "Please share quotation"
}
```

| Field | Rules |
| --- | --- |
| `customerName` | Required, 2 to 80 characters |
| `phone` | Required Indian mobile number. Stored as 10 digits |
| `email` | Optional |
| `productId` | Optional. Must be an active product that is not a demo |
| `productName` | Optional. Replaced with the database name when `productId` matches |
| `enquiryType` | `WHOLESALE` or `RETAIL` |
| `quantity` | Required number greater than 0 |
| `quantityUnit` | `SQ_FT`, `SQ_M`, `PIECES`, `SLABS`, or `BOXES` |
| `message` | Optional, up to 1000 characters |
| `locale` | Optional `en` or `hi`. Chooses the validation message language and is not stored. The default is English |

The request cannot set a price. New enquiries are stored as `PENDING`. Validation messages stay English unless `locale` is `hi`.

```json
{
  "success": true,
  "message": "Enquiry saved successfully",
  "data": { "id": "cm...", "status": "PENDING" },
  "meta": {}
}
```

## GET /api/settings

Authentication: none.

Returns the public showroom details. Secrets and admin fields are not included.

```json
{
  "success": true,
  "message": "Business settings fetched successfully",
  "data": {
    "businessName": "FK Marble",
    "tagline": "STONE & SURFACES",
    "phone": "9045760027",
    "whatsappNumber": "9045760027",
    "address": "177, ITI Chauraha",
    "city": "Etawah",
    "state": "Uttar Pradesh",
    "openingTime": "09:00 AM",
    "closingTime": "08:00 PM",
    "businessDescription": "Wholesale and retail supplier of tiles, marble, granite, Kota stone, sandstone, and other natural stone in Etawah, Uttar Pradesh."
  },
  "meta": {}
}
```
