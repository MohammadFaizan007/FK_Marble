import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const maxBytes = 5 * 1024 * 1024;

const folders = ["categories", "products"] as const;

export type UploadFolder = (typeof folders)[number];

const storedPattern = /^\/uploads\/(categories|products)\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export class LocalUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalUploadError";
  }
}

export function imageKind(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

export function isUploadFolder(value: string): value is UploadFolder {
  return folders.some((folder) => folder === value);
}

export function isStoredUpload(value: string) {
  return storedPattern.test(value);
}

export function isStoredCategoryImage(value: string) {
  return value.startsWith("/uploads/categories/") && isStoredUpload(value);
}

export async function storeUploadedImage(bytes: Uint8Array, folder: UploadFolder) {
  if (bytes.byteLength === 0 || bytes.byteLength > maxBytes) {
    throw new LocalUploadError("Choose an image up to 5 MB.");
  }

  const kind = imageKind(bytes);

  if (!kind) {
    throw new LocalUploadError("Use a JPG, PNG, or WebP image.");
  }

  const name = `${randomUUID()}.${kind}`;
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `/uploads/${folder}/${name}`;
}

export function storeCategoryImage(bytes: Uint8Array) {
  return storeUploadedImage(bytes, "categories");
}

export async function removeStoredUpload(value: string) {
  if (!isStoredUpload(value)) {
    return;
  }

  const [, folder, name] = value.match(/^\/uploads\/(categories|products)\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/) ?? [];

  if (!folder || !name || !isUploadFolder(folder)) {
    return;
  }

  await unlink(path.join(process.cwd(), "public", "uploads", folder, name)).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  });
}

export function removeStoredCategoryImage(value: string) {
  return removeStoredUpload(value);
}
