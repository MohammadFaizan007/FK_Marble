import { writeAuditLog } from "@/lib/audit-log";
import { apiError, apiSuccess } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { LocalUploadError, removeStoredUpload, storeUploadedImage, type UploadFolder } from "@/lib/local-upload";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "product.create") && !hasPermission(profile.role, "product.update")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const upload = await readUpload(request);

  if (!upload.ok) {
    return apiError(upload.message, 400);
  }

  let image: string;

  try {
    image = await storeUploadedImage(new Uint8Array(await upload.file.arrayBuffer()), upload.folder);
  } catch (error) {
    if (error instanceof LocalUploadError) {
      return apiError(error.message, 400);
    }

    throw error;
  }

  try {
    await getPrisma().$transaction(async (db) => {
      await writeAuditLog(db, {
        actorId: profile.id,
        action: upload.folder === "products" ? "product.image.store" : "category.image",
        entityType: upload.folder === "products" ? "ProductImage" : "CategoryImage",
        entityId: image,
        summary: upload.folder === "products" ? "Stored a product image" : "Stored a category image",
      });
    });
  } catch (error) {
    await removeStoredUpload(image);
    throw error;
  }

  return apiSuccess("Image stored", { image }, {}, 201);
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && value.size > 0;
}

async function readUpload(
  request: Request,
): Promise<{ ok: true; file: File; folder: UploadFolder } | { ok: false; message: string }> {
  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return { ok: false, message: "Choose an image from your computer." };
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "categories");

  if (typeof file === "string" || !file) {
    return { ok: false, message: "Choose an image from your computer." };
  }

  const folderName = folder === "products" || folder === "categories" ? folder : null;

  if (!folderName || !isUploadFile(file)) {
    return { ok: false, message: "Choose an image from your computer." };
  }

  return { ok: true, file, folder: folderName };
}
