// src/lib/validation/product.ts

import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().trim().min(1, "ชื่อสินค้า ห้ามว่าง"),
  brand: z.string().trim().optional().default(""),
  sku: z.string().trim().optional().default(""),
  price: z.number().finite().nonnegative("ราคา ต้องเป็นตัวเลข 0+"),
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  image_url: z.string().trim().min(1, "รูปภาพ ห้ามว่าง").optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export function validateProductInput(input: any): ProductInput {
  const parsed = ProductSchema.safeParse({
    ...input,
    price: typeof input?.price === "string" ? Number(input.price) : input?.price,
    discountPercent: typeof input?.discountPercent === "string" ? Number(input.discountPercent) : input?.discountPercent,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(", ");
    throw new Error(msg || "Validation failed");
  }
  return parsed.data;
}
