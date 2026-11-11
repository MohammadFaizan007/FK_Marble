import assert from "node:assert/strict";
import test from "node:test";
import { errorBody, successBody } from "../src/lib/api-response";

test("success responses keep a stable shape", () => {
  assert.deepEqual(successBody("Products fetched successfully", [{ id: "prod-1" }], { page: 1 }), {
    success: true,
    message: "Products fetched successfully",
    data: [{ id: "prod-1" }],
    meta: { page: 1 },
  });
});

test("error responses include field errors", () => {
  assert.deepEqual(errorBody("Check the request and try again.", [{ field: "phone", message: "Invalid" }]), {
    success: false,
    message: "Check the request and try again.",
    errors: [{ field: "phone", message: "Invalid" }],
  });
});
