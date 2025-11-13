// src/app/api/mock/products/_store/product.crud.ts

import { prismaInterlink } from "@/lib/db";
// IMPORT TYPE
import { UIProduct, MetaPatch, ProductsMeta } from "./product.types"; // 💡 เพิ่ม ProductsMeta เพื่อความชัดเจน

// 🎯 แก้ไข Import HELPERS: ลบ metaStore และ getMeta ออก
// แล้วแทนที่ด้วย setMetaStore, getMetaStore ที่เป็นฟังก์ชัน
import {
  ensureTZ, coerceId, TABLE, META_TABLE, 
  toDiscountLabel, normalizeBasePath, parseDiscountLabel, defaultCardPartsVisibility,
  setMetaStore, // 🎯 NEW: Setter function
  getMetaStore  // 🎯 NEW: Getter function
} from "./product.helpers";
// IMPORT getById จากไฟล์ query เดียวกัน
import { getById } from "./product.query"; 

/** ===== Meta: เขียนกลับ DB (upsert id=1) ===== */
// 💡 เปลี่ยนจาก async function setMeta(patch: MetaPatch) เป็น Promise<ProductsMeta>
export async function setMeta(patch: MetaPatch): Promise<ProductsMeta> {
  await ensureTZ();

  // 🎯 แก้ไข: ไม่ใช้ getMeta (เพราะไม่ได้ export ใน query.ts แล้ว) 
  // แต่เราจะใช้ getMetaStore() เพื่อโหลดค่าเริ่มต้นจาก in-memory 
  // หรือเขียนตรรกะโหลดจาก DB เข้าไปใน getMetaStore/setMetaStore ใน product.helpers (ถ้าเป็น state จริงๆ)
  // แต่จากโค้ดเดิมที่ใช้ getMeta() (ซึ่งเดิมน่าจะเรียก getMetaStore) 
  // เราจะใช้ getMetaStore() แทนในการโหลดค่าปัจจุบัน (current meta state)
  const current = getMetaStore(); 

  // รวมค่าใหม่ (รวม nested cardParts)
  const next: ProductsMeta = { // 💡 ระบุ Type ให้ชัดเจน
    title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : current.title,
    subtitle: typeof patch.subtitle === "string" && patch.subtitle.trim() ? patch.subtitle.trim() : current.subtitle,
    updatedAt: new Date().toISOString(),
    cardParts: { ...current.cardParts, ...(patch.cardParts ?? {}) },
  };

  // Upsert: ถ้ามีแล้ว → UPDATE, ถ้าไม่มีก็ INSERT id=1
  const existsRows: any[] = await prismaInterlink.$queryRawUnsafe(
    `SELECT 1 AS ok FROM ${META_TABLE} WHERE id = 1 LIMIT 1`
  );
  const cardPartsJson = JSON.stringify(next.cardParts);

  if (existsRows?.length) {
    await prismaInterlink.$executeRawUnsafe(
      `
      UPDATE ${META_TABLE}
      SET title = ?, subtitle = ?, card_parts = ?, updated_at = NOW()
      WHERE id = 1
      `,
      next.title,
      next.subtitle,
      cardPartsJson
    );
  } else {
    await prismaInterlink.$executeRawUnsafe(
      `
      INSERT INTO ${META_TABLE} (id, title, subtitle, card_parts, updated_at)
      VALUES (1, ?, ?, ?, NOW())
      `,
      next.title,
      next.subtitle,
      cardPartsJson
    );
  }

  // sync เข้า in-memory
  // 🎯 แก้ไข: ใช้ Setter function
  setMetaStore(next);
  return next;
}

/** ===== Mutations (คงอินเตอร์เฟซเดิม) ===== */

export async function setVisible(id: UIProduct["id"], visible: boolean) {
// ... โค้ด setVisible เหมือนเดิม ...
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `UPDATE ${TABLE} SET visible = ?, updated_at = NOW() WHERE product_id = ?`,
    visible ? 1 : 0,
    coerceId(id)
  );
}

export async function toggleVisible(id: UIProduct["id"]) {
// ... โค้ด toggleVisible เหมือนเดิม ...
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `UPDATE ${TABLE} SET visible = IF(visible=1,0,1), updated_at = NOW() WHERE product_id = ?`,
    coerceId(id)
  );
}

export async function remove(id: UIProduct["id"]) {
// ... โค้ด remove เหมือนเดิม ...
  await ensureTZ();
  await prismaInterlink.$executeRawUnsafe(
    `DELETE FROM ${TABLE} WHERE product_id = ?`,
    coerceId(id)
  );
}

export async function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
// ... โค้ด reorder เหมือนเดิม ...
  await ensureTZ();
  if (!orders?.length) return;

  const ids = orders.map((o) => Number(coerceId(o.id)));
  const caseWhen = orders
    .map((o) => `WHEN ${Number(coerceId(o.id))} THEN ${Number(o.order)}`)
    .join(" ");
  const inList = ids.join(", ");

  const sql = `
    UPDATE ${TABLE}
    SET display_order = CASE product_id ${caseWhen} END,
      updated_at = NOW()
    WHERE product_id IN (${inList})
  `;
  await prismaInterlink.$executeRawUnsafe(sql);
}

export async function upsert(p: Partial<UIProduct>): Promise<UIProduct> {
// ... โค้ด upsert เหมือนเดิม ...
  await ensureTZ();
  const hasId = typeof p.id !== "undefined" && p.id !== null;

  if (hasId) {
    // UPDATE เฉพาะฟิลด์ที่ส่งมา
    const fields: string[] = [];
    const values: any[] = [];
    const push = (col: string, val: any) => { fields.push(`${col} = ?`); values.push(val); };

    if (typeof p.name !== "undefined")        push("product_name", String(p.name));
    if (typeof p.brand !== "undefined")       push("product_brand", p.brand ?? null);
    if (typeof p.sku !== "undefined")         push("product_filename", p.sku ?? null); // ใช้ช่องเดิมตาม mock
    if (typeof p.price !== "undefined")       push("product_price", Number(p.price) || 0);
    if (typeof p.discountPercent !== "undefined") push("discount_label", toDiscountLabel(p.discountPercent));
    if (typeof p.image_url !== "undefined")   push("image_url", p.image_url ?? null);
    if (typeof p.visible !== "undefined")     push("visible", p.visible ? 1 : 0);
    if (typeof p.order !== "undefined")       push("display_order", Number(p.order) || 0);
    if (typeof p.rating !== "undefined")      push("rating_score", p.rating == null ? null : Number(p.rating));
    if (typeof p.reviews !== "undefined")     push("rating_count", p.reviews == null ? null : Number(p.reviews));
    if (typeof p.category_id !== "undefined") push("category_id", p.category_id == null ? null : coerceId(p.category_id));
    if (typeof p.uom !== "undefined")         push("product_uom", p.uom ?? null);

    if (fields.length) {
      const sql = `UPDATE ${TABLE} SET ${fields.join(", ")}, updated_at = NOW() WHERE product_id = ?`;
      values.push(coerceId(p.id));
      await prismaInterlink.$executeRawUnsafe(sql, ...values);
    }

    const row = await getById(p.id as any);
    if (!row) throw new Error("Product not found after update");
    return row;
  } else {
    // INSERT ใหม่ (order = max(display_order)+1)
    const nextOrderRows: any[] = await prismaInterlink.$queryRawUnsafe(
      `SELECT COALESCE(MAX(display_order), -1) + 1 AS nextOrder FROM ${TABLE}`
    );
    const nextOrder = Number(nextOrderRows?.[0]?.nextOrder ?? 0);

    await prismaInterlink.$executeRawUnsafe(
      `
      INSERT INTO ${TABLE}
        (product_name, product_brand, product_filename, product_price, discount_label, image_url, visible,
         display_order, rating_score, rating_count, category_id, product_uom, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      String(p.name ?? "New Product"),
      p.brand ?? null,
      p.sku ?? null,
      Number(p.price) || 0,
      toDiscountLabel(p.discountPercent),
      p.image_url ?? null,
      p.visible ? 1 : 0,
      nextOrder,
      p.rating == null ? null : Number(p.rating),
      p.reviews == null ? null : Number(p.reviews),
      p.category_id == null ? null : coerceId(p.category_id),
      p.uom ?? null
    );

    // ดึง id ที่เพิ่ง insert มา (cast เป็น number กัน BigInt)
    const insertedIdRows: any[] = await prismaInterlink.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`);
    const newId = Number(insertedIdRows?.[0]?.id);
    const row = await getById(newId);
    if (!row) throw new Error("Product not found after insert");
    return row;
  }
}

/** (dev only) reset — ไม่ยุ่ง DB เพื่อเลี่ยงลบข้อมูลจริง */
export function reset() {
  // 🎯 แก้ไข: ใช้ Getter/Setter แทนการกำหนดค่าตรงๆ
  const currentMeta = getMetaStore();
  const nextMeta = { ...currentMeta, updatedAt: new Date().toISOString() };
  setMetaStore(nextMeta);
}