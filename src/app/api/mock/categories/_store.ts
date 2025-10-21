// v.1.1.4 ================================================
// src/app/api/mock/categories/_store.ts
// DB-only version: ต่อ MySQL ผ่าน Prisma (interlink) ไม่มี seed/reset

import { prismaInterlink } from "@/lib/db"; // 👈 ปรับ path ให้ตรงโปรเจกต์คุณ

/** ========== Types ========== */
export type UICategory = {
  id: number | string;
  name: string;
  slug: string;
  image_url?: string;
  visible?: boolean;
  order: number;
};

export type CategoriesMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string; // ISO string
};

/** ========== Adapters ========== */
function toUICategory(row: any): UICategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image_url: row.image_url ?? undefined,
    visible: row.visible,
    order: row.display_order ?? 0,
  };
}

function toMeta(row: any | null): CategoriesMeta {
  if (!row) return { title: "", subtitle: "", updatedAt: undefined };
  return {
    title: row.title,
    subtitle: row.subtitle,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

/** ========== Queries ========== */

/** คืนรายการทั้งหมด (เลือกได้ว่าจะกรองซ่อนของที่ไม่ visible) */
export async function getAll(opts?: { includeHidden?: boolean }): Promise<UICategory[]> {
  const includeHidden = opts?.includeHidden ?? true;
  const rows = await prismaInterlink.ui_categories.findMany({
    where: includeHidden ? {} : { visible: true },
    orderBy: { display_order: "asc" },
  });
  return rows.map(toUICategory);
}

/** อ่าน meta ปัจจุบัน (ไม่สร้างอัตโนมัติ) */
export async function getMeta(): Promise<CategoriesMeta> {
  const row = await prismaInterlink.ui_categories_meta.findUnique({ where: { id: 1 } });
  return toMeta(row);
}

/** ========== Mutations ========== */

/** อัปเดต meta เฉพาะฟิลด์ที่ส่งมา (upsert เมื่อถูกเรียกใช้งาน) */
export async function setMeta(patch: Partial<CategoriesMeta>): Promise<void> {
  const data: any = {};
  if (typeof patch.title === "string") data.title = patch.title;
  if (typeof patch.subtitle === "string") data.subtitle = patch.subtitle;

  await prismaInterlink.ui_categories_meta.upsert({
    where: { id: 1 },
    update: { ...data, updated_at: new Date() },
    create: { id: 1, title: data.title ?? "", subtitle: data.subtitle ?? "", updated_at: new Date() },
  });
}

/** ตั้งค่าการมองเห็น */
export async function setVisible(id: UICategory["id"], visible: boolean): Promise<void> {
  await prismaInterlink.ui_categories.update({
    where: { id: Number(id) },
    data: { visible },
  });
}

/** toggle การมองเห็น */
export async function toggleVisible(id: UICategory["id"]): Promise<void> {
  const current = await prismaInterlink.ui_categories.findUnique({
    where: { id: Number(id) },
    select: { visible: true },
  });
  if (!current) return;
  await prismaInterlink.ui_categories.update({
    where: { id: Number(id) },
    data: { visible: !current.visible },
  });
}

/** ลบแล้ว reindex order ให้ต่อเนื่อง */
export async function remove(id: UICategory["id"]): Promise<void> {
  await prismaInterlink.$transaction(async (tx) => {
    await tx.ui_categories.delete({ where: { id: Number(id) } });
    const remaining = await tx.ui_categories.findMany({
      orderBy: { display_order: "asc" },
      select: { id: true },
    });
    await Promise.all(
      remaining.map((row, i) =>
        tx.ui_categories.update({ where: { id: row.id }, data: { display_order: i } })
      )
    );
  });
}

/** จัดลำดับใหม่จาก payload orders แล้ว reindex ให้ต่อเนื่อง */
export async function reorder(orders: { id: UICategory["id"]; order: number }[]): Promise<void> {
  const map = new Map<number, number>(orders.map((o) => [Number(o.id), o.order]));
  await prismaInterlink.$transaction(async (tx) => {
    const all = await tx.ui_categories.findMany({
      orderBy: { display_order: "asc" },
      select: { id: true, display_order: true },
    });
    const withNewOrder = all.map((r) => ({ id: r.id, order: map.get(r.id) ?? r.display_order ?? 0 }));
    withNewOrder.sort((a, b) => a.order - b.order);
    await Promise.all(
      withNewOrder.map((r, i) =>
        tx.ui_categories.update({ where: { id: r.id }, data: { display_order: i } })
      )
    );
  });
}

/** เพิ่มใหม่หรือแก้ไข (create จะต่อท้าย order ปัจจุบัน) */
export async function upsert(cat: Partial<UICategory>): Promise<UICategory> {
  const data: any = {};
  if (typeof cat.name === "string") data.name = cat.name;
  if (typeof cat.slug === "string") data.slug = cat.slug;
  if (typeof cat.image_url === "string") data.image_url = cat.image_url;
  if (typeof cat.visible === "boolean") data.visible = cat.visible;

  if (typeof cat.id !== "undefined") {
    const updated = await prismaInterlink.ui_categories.update({
      where: { id: Number(cat.id) },
      data,
    });
    return toUICategory(updated);
  } else {
    const count = await prismaInterlink.ui_categories.count();
    const created = await prismaInterlink.ui_categories.create({
      data: {
        name: data.name ?? "New Category",
        slug: data.slug ?? String(Date.now()),
        image_url: data.image_url ?? null,
        visible: typeof data.visible === "boolean" ? data.visible : false,
        display_order: count,
      },
    });
    return toUICategory(created);
  }
}

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/api/mock/categories/_store.ts

// /** ========== Types ========== */
// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order: number;
// };

// export type CategoriesMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string; // บันทึกเวลาแก้ไขล่าสุด (optional)
// };

// /** ========== Seed data ========== */
// const seed: Omit<UICategory, "order">[] = [
//   { id: 1, slug: "lan-utp",        name: "LAN (UTP) System",                  image_url: "/assets/category-lan-utp.jpg",         visible: true },
//   { id: 2, slug: "fiber-optic",    name: "FIBER OPTIC System",               image_url: "/assets/category-fiber-optic.jpg",     visible: true },
//   { id: 3, slug: "telephone",      name: "Telephone CABLE",                  image_url: "/assets/category-telephone.jpg",       visible: true },
//   { id: 4, slug: "fttr-fttx",      name: "FTTR/FTTx OVAL / FLAT CABLE",      image_url: "/assets/category-fttr-fttx.jpg",       visible: true },
//   { id: 5, slug: "data-center",    name: "DATA CENTER System",               image_url: "/assets/category-data-center.jpg",     visible: true },
//   { id: 6, slug: "coaxial",        name: "COAXIAL (RG) System",              image_url: "/assets/category-coaxial.jpg",         visible: true },
//   { id: 7, slug: "solar",          name: "SOLAR CABLE",                      image_url: "/assets/category-solar.jpg",           visible: true },
//   { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System",    image_url: "/assets/category-security-control.jpg",visible: true },
//   { id: 9, slug: "networking",     name: "NETWORKING System",                image_url: "/assets/category-networking.jpg",      visible: true },
//   { id: 10, slug: "germany-rack",  name: "GERMANY RACK",                     image_url: "/assets/category-germany-rack.jpg",    visible: true },
//   { id: 11, slug: "cctv-cabinet",  name: "CCTV OUTDOOR CABINET",             image_url: "/assets/category-cctv-cabinet.jpg",    visible: true },
//   { id: 12, slug: "link-rack",     name: "LINK RACK",                        image_url: "/assets/category-link-rack.jpg",       visible: true },
// ];

// /** ข้อความเริ่มต้นของบล็อค */
// const seedMeta: CategoriesMeta = {
//   title: "หมวดหมู่สินค้า",
//   subtitle: "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย",
//   updatedAt: new Date().toISOString(),
// };

// /** ========== Module-level state (in-memory) ========== */
// let state: UICategory[] = seed.map((x, i) => ({ ...x, order: i }));
// let meta: CategoriesMeta = { ...seedMeta };

// /** ========== Helpers ========== */
// const sortByOrder = (a: UICategory, b: UICategory) => (a.order ?? 0) - (b.order ?? 0);

// /** ========== Queries ========== */

// /** คืนรายการทั้งหมด (เลือกได้ว่าจะกรองซ่อนของที่ไม่ visible) */
// export function getAll(opts?: { includeHidden?: boolean }): UICategory[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// /** อ่าน meta ปัจจุบัน */
// export function getMeta(): CategoriesMeta {
//   return { ...meta };
// }

// /** ========== Mutations ========== */

// /** อัปเดต meta เฉพาะฟิลด์ที่ส่งมา */
// export function setMeta(patch: Partial<CategoriesMeta>) {
//   meta = {
//     ...meta,
//     ...patch,
//     updatedAt: new Date().toISOString(),
//   };
// }

// /** ตั้งค่าการมองเห็น */
// export function setVisible(id: UICategory["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// /** toggle การมองเห็น */
// export function toggleVisible(id: UICategory["id"]) {
//   state = state.map((x) =>
//     x.id === id ? { ...x, visible: !(x.visible ?? true) } : x
//   );
// }

// /** ลบแล้ว reindex order ให้ต่อเนื่อง */
// export function remove(id: UICategory["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// /** จัดลำดับใหม่จาก payload orders แล้ว reindex ให้ต่อเนื่อง */
// export function reorder(orders: { id: UICategory["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** เพิ่มใหม่หรือแก้ไข (ถ้าส่ง id ที่มีอยู่จะถือว่าแก้ไข) */
// export function upsert(cat: Partial<UICategory>): UICategory {
//   const existsIndex = state.findIndex((c) => c.id === cat.id);
//   if (existsIndex >= 0) {
//     // update
//     const merged: UICategory = { ...state[existsIndex], ...cat } as UICategory;
//     state = state.map((c, i) => (i === existsIndex ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     // create
//     const nextId =
//       typeof cat.id !== "undefined"
//         ? cat.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UICategory = {
//       id: nextId,
//       name: cat.name ?? "New Category",
//       slug: cat.slug ?? String(nextId),
//       image_url: cat.image_url ?? "/placeholder.png",
//       visible: cat.visible ?? false,
//       order: state.length, // ต่อท้าย
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// /** สำหรับ dev: รีเซ็ตเป็นค่าเริ่มต้น */
// export function reset() {
//   state = seed.map((x, i) => ({ ...x, order: i }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/api/mock/categories/_store.ts

// /** ========== Types ========== */
// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order: number;
// };

// export type CategoriesMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string; // บันทึกเวลาแก้ไขล่าสุด (optional)
// };

// /** ========== Seed data ========== */
// const seed: Omit<UICategory, "order">[] = [
//   { id: 1, slug: "lan-utp",        name: "LAN (UTP) System",                  image_url: "/assets/category-lan-utp.jpg",         visible: true },
//   { id: 2, slug: "fiber-optic",    name: "FIBER OPTIC System",               image_url: "/assets/category-fiber-optic.jpg",     visible: true },
//   { id: 3, slug: "telephone",      name: "Telephone CABLE",                  image_url: "/assets/category-telephone.jpg",       visible: true },
//   { id: 4, slug: "fttr-fttx",      name: "FTTR/FTTx OVAL / FLAT CABLE",      image_url: "/assets/category-fttr-fttx.jpg",       visible: true },
//   { id: 5, slug: "data-center",    name: "DATA CENTER System",               image_url: "/assets/category-data-center.jpg",     visible: true },
//   { id: 6, slug: "coaxial",        name: "COAXIAL (RG) System",              image_url: "/assets/category-coaxial.jpg",         visible: true },
//   { id: 7, slug: "solar",          name: "SOLAR CABLE",                      image_url: "/assets/category-solar.jpg",           visible: true },
//   { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System",    image_url: "/assets/category-security-control.jpg",visible: true },
//   { id: 9, slug: "networking",     name: "NETWORKING System",                image_url: "/assets/category-networking.jpg",      visible: true },
//   { id: 10, slug: "germany-rack",  name: "GERMANY RACK",                     image_url: "/assets/category-germany-rack.jpg",    visible: true },
//   { id: 11, slug: "cctv-cabinet",  name: "CCTV OUTDOOR CABINET",             image_url: "/assets/category-cctv-cabinet.jpg",    visible: true },
//   { id: 12, slug: "link-rack",     name: "LINK RACK",                        image_url: "/assets/category-link-rack.jpg",       visible: true },
// ];

// /** ข้อความเริ่มต้นของบล็อค */
// const seedMeta: CategoriesMeta = {
//   title: "หมวดหมู่สินค้า",
//   subtitle: "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย",
//   updatedAt: new Date().toISOString(),
// };

// /** ========== Module-level state (in-memory) ========== */
// let state: UICategory[] = seed.map((x, i) => ({ ...x, order: i }));
// let meta: CategoriesMeta = { ...seedMeta };

// /** ========== Helpers ========== */
// const sortByOrder = (a: UICategory, b: UICategory) => (a.order ?? 0) - (b.order ?? 0);

// /** ========== Queries ========== */

// /** คืนรายการทั้งหมด (เลือกได้ว่าจะกรองซ่อนของที่ไม่ visible) */
// export function getAll(opts?: { includeHidden?: boolean }): UICategory[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// /** อ่าน meta ปัจจุบัน */
// export function getMeta(): CategoriesMeta {
//   return { ...meta };
// }

// /** ========== Mutations ========== */

// /** อัปเดต meta เฉพาะฟิลด์ที่ส่งมา */
// export function setMeta(patch: Partial<CategoriesMeta>) {
//   meta = {
//     ...meta,
//     ...patch,
//     updatedAt: new Date().toISOString(),
//   };
// }

// /** ตั้งค่าการมองเห็น */
// export function setVisible(id: UICategory["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// /** toggle การมองเห็น */
// export function toggleVisible(id: UICategory["id"]) {
//   state = state.map((x) =>
//     x.id === id ? { ...x, visible: !(x.visible ?? true) } : x
//   );
// }

// /** ลบแล้ว reindex order ให้ต่อเนื่อง */
// export function remove(id: UICategory["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// /** จัดลำดับใหม่จาก payload orders แล้ว reindex ให้ต่อเนื่อง */
// export function reorder(orders: { id: UICategory["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** เพิ่มใหม่หรือแก้ไข (ถ้าส่ง id ที่มีอยู่จะถือว่าแก้ไข) */
// export function upsert(cat: Partial<UICategory>) {
//   const existsIndex = state.findIndex((c) => c.id === cat.id);
//   if (existsIndex >= 0) {
//     // update
//     const merged: UICategory = { ...state[existsIndex], ...cat } as UICategory;
//     state = state.map((c, i) => (i === existsIndex ? merged : c)).sort(sortByOrder);
//   } else {
//     // create
//     const nextId =
//       typeof cat.id !== "undefined"
//         ? cat.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UICategory = {
//       id: nextId,
//       name: cat.name ?? "New Category",
//       slug: cat.slug ?? String(nextId),
//       image_url: cat.image_url ?? "/placeholder.png",
//       visible: cat.visible ?? true,
//       order: state.length, // ต่อท้าย
//     };
//     state = [...state, newItem].sort(sortByOrder);
//   }
// }

// /** สำหรับ dev: รีเซ็ตเป็นค่าเริ่มต้น */
// export function reset() {
//   state = seed.map((x, i) => ({ ...x, order: i }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.2 ================================================

// // src/app/api/mock/categories/_store.ts

// export type UICategory = {
//   id: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order: number;
// };


// // seed เริ่มต้น
// const seed: Omit<UICategory, "order">[] = [
//     { id: 1, slug: "lan-utp", name: "LAN (UTP) System", image_url: "/assets/category-lan-utp.jpg", visible: true},
//     { id: 2, slug: "fiber-optic", name: "FIBER OPTIC System", image_url: "/assets/category-fiber-optic.jpg", visible: true},
//     { id: 3, slug: "telephone", name: "Telephone CABLE", image_url: "/assets/category-telephone.jpg", visible: true},
//     { id: 4, slug: "fttr-fttx", name: "FTTR/FTTx OVAL / FLAT CABLE", image_url: "/assets/category-fttr-fttx.jpg", visible: true},
//     { id: 5, slug: "data-center", name: "DATA CENTER System", image_url: "/assets/category-data-center.jpg", visible: true},
//     { id: 6, slug: "coaxial", name: "COAXIAL (RG) System", image_url: "/assets/category-coaxial.jpg", visible: true},
//     { id: 7, slug: "solar", name: "SOLAR CABLE", image_url: "/assets/category-solar.jpg", visible: true},
//     { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System", image_url: "/assets/category-security-control.jpg", visible: true},
//     { id: 9, slug: "networking", name: "NETWORKING System", image_url: "/assets/category-networking.jpg", visible: true},
//     { id: 10, slug: "germany-rack", name: "GERMANY RACK", image_url: "/assets/category-germany-rack.jpg", visible: true},
//     { id: 11, slug: "cctv-cabinet", name: "CCTV OUTDOOR CABINET", image_url: "/assets/category-cctv-cabinet.jpg", visible: true},
//     { id: 12, slug: "link-rack", name: "LINK RACK", image_url: "/assets/category-link-rack.jpg", visible: true},
//   // …เติมตามต้องการ
// ];

// // module-level state
// let state: UICategory[] = seed.map((x, i) => ({ ...x, order: i }));

// export function getAll(): UICategory[] {
//   // ส่งแบบเรียงตาม order เสมอ
//   return [...state].sort((a, b) => a.order - b.order);
// }

// export function setVisible(id: UICategory["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function remove(id: UICategory["id"]) {
//   state = state.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UICategory["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state.map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//                .sort((a, b) => a.order - b.order)
//                .map((x, i) => ({ ...x, order: i }));
// }
