// v.1.1.2 ===============================================
// src/lib/validation/product.ts
import { z } from "zod";

/** อนุญาตทั้ง string/number และปล่อยว่างได้ (จะตีเป็น undefined) */
const CategoryIdSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === "" || v === null ? undefined : v));

/** image_url ไม่บังคับ: ถ้าเป็น "" จะตีเป็น undefined */
const ImageUrlSchema = z
  .union([z.string().trim().min(1), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const ProductSchema = z.object({
  name: z.string().trim().min(1, "ชื่อสินค้า ห้ามว่าง"),

  brand: z.string().trim().optional().default(""),
  sku: z.string().trim().optional().default(""),

  // ใช้ coerce เพื่อรองรับค่าที่มาจาก input เป็น string
  price: z.coerce.number().finite().nonnegative("ราคา ต้องเป็นตัวเลข 0+"),
  discountPercent: z.coerce.number().int().min(0).max(100).optional().default(0),

  image_url: ImageUrlSchema,

  // ฟิลด์ใหม่
  category_id: CategoryIdSchema,
  uom: z.string().trim().optional().default(""),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviews: z.coerce.number().int().min(0).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export function validateProductInput(input: unknown): ProductInput {
  const parsed = ProductSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg || "Validation failed");
  }
  return parsed.data;
}

// v.1.1.2 ===============================================

// // src/lib/validation/product.ts

// import { z } from "zod";

// const ProductSchema = z.object({
//   name: z.string().trim().min(1, "ชื่อสินค้า ห้ามว่าง"),
//   brand: z.string().trim().optional().default(""),
//   sku: z.string().trim().optional().default(""),
//   price: z.number().finite().nonnegative("ราคา ต้องเป็นตัวเลข 0+"),
//   discountPercent: z.number().int().min(0).max(100).optional().default(0),
//   image_url: z.string().trim().min(1, "รูปภาพ ห้ามว่าง").optional(),
// });

// export type ProductInput = z.infer<typeof ProductSchema>;

// export function validateProductInput(input: any): ProductInput {
//   const parsed = ProductSchema.safeParse({
//     ...input,
//     price: typeof input?.price === "string" ? Number(input.price) : input?.price,
//     discountPercent: typeof input?.discountPercent === "string" ? Number(input.discountPercent) : input?.discountPercent,
//   });
//   if (!parsed.success) {
//     const msg = parsed.error.issues.map(i => i.message).join(", ");
//     throw new Error(msg || "Validation failed");
//   }
//   return parsed.data;
// }
