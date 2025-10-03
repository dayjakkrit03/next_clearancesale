// src/lib/validation/category.ts

export type CategoryInput = {
  name?: unknown;
  slug?: unknown;
  image_url?: unknown;
  visible?: unknown;
};

export type ValidationResult =
  | { ok: true; data: { name: string; slug: string; image_url: string; visible?: boolean } }
  | { ok: false; errors: string[] };

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function slugify(input: string) {
  return (input ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** สร้างใหม่: บังคับให้ทั้ง 3 ฟิลด์ไม่ว่าง */
export function validateCategoryCreate(payload: CategoryInput): ValidationResult {
  const errors: string[] = [];

  const name = isNonEmptyString(payload.name) ? payload.name.trim() : "";
  if (!name) errors.push("ชื่อ (name) ห้ามว่าง");

  const slugRaw = isNonEmptyString(payload.slug) ? payload.slug.trim() : "";
  const slug = slugify(slugRaw || name);
  if (!slug) errors.push("Slug ห้ามว่าง");

  const image_url = isNonEmptyString(payload.image_url) ? payload.image_url.trim() : "";
  if (!image_url) errors.push("รูปภาพ (image_url) ห้ามว่าง");

  if (errors.length) return { ok: false, errors };
  return { ok: true, data: { name, slug, image_url, visible: payload.visible as boolean | undefined } };
}

/** แก้ไข: ในโปรเจ็กต์นี้ฝั่ง client ส่งทั้ง 3 ฟิลด์มาเสมอ -> บังคับให้ไม่ว่างเหมือนกัน */
export function validateCategoryUpdate(payload: CategoryInput): ValidationResult {
  return validateCategoryCreate(payload);
}

export { slugify };
