// v.1.1.3 ================================================
// src/app/api/mock/categories/_store.ts

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
  updatedAt?: string; // บันทึกเวลาแก้ไขล่าสุด (optional)
};

/** ========== Seed data ========== */
const seed: Omit<UICategory, "order">[] = [
  { id: 1, slug: "lan-utp",        name: "LAN (UTP) System",                  image_url: "/assets/category-lan-utp.jpg",         visible: true },
  { id: 2, slug: "fiber-optic",    name: "FIBER OPTIC System",               image_url: "/assets/category-fiber-optic.jpg",     visible: true },
  { id: 3, slug: "telephone",      name: "Telephone CABLE",                  image_url: "/assets/category-telephone.jpg",       visible: true },
  { id: 4, slug: "fttr-fttx",      name: "FTTR/FTTx OVAL / FLAT CABLE",      image_url: "/assets/category-fttr-fttx.jpg",       visible: true },
  { id: 5, slug: "data-center",    name: "DATA CENTER System",               image_url: "/assets/category-data-center.jpg",     visible: true },
  { id: 6, slug: "coaxial",        name: "COAXIAL (RG) System",              image_url: "/assets/category-coaxial.jpg",         visible: true },
  { id: 7, slug: "solar",          name: "SOLAR CABLE",                      image_url: "/assets/category-solar.jpg",           visible: true },
  { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System",    image_url: "/assets/category-security-control.jpg",visible: true },
  { id: 9, slug: "networking",     name: "NETWORKING System",                image_url: "/assets/category-networking.jpg",      visible: true },
  { id: 10, slug: "germany-rack",  name: "GERMANY RACK",                     image_url: "/assets/category-germany-rack.jpg",    visible: true },
  { id: 11, slug: "cctv-cabinet",  name: "CCTV OUTDOOR CABINET",             image_url: "/assets/category-cctv-cabinet.jpg",    visible: true },
  { id: 12, slug: "link-rack",     name: "LINK RACK",                        image_url: "/assets/category-link-rack.jpg",       visible: true },
];

/** ข้อความเริ่มต้นของบล็อค */
const seedMeta: CategoriesMeta = {
  title: "หมวดหมู่สินค้า",
  subtitle: "เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย",
  updatedAt: new Date().toISOString(),
};

/** ========== Module-level state (in-memory) ========== */
let state: UICategory[] = seed.map((x, i) => ({ ...x, order: i }));
let meta: CategoriesMeta = { ...seedMeta };

/** ========== Helpers ========== */
const sortByOrder = (a: UICategory, b: UICategory) => (a.order ?? 0) - (b.order ?? 0);

/** ========== Queries ========== */

/** คืนรายการทั้งหมด (เลือกได้ว่าจะกรองซ่อนของที่ไม่ visible) */
export function getAll(opts?: { includeHidden?: boolean }): UICategory[] {
  const includeHidden = opts?.includeHidden ?? true;
  const list = includeHidden ? state : state.filter((c) => c.visible !== false);
  return [...list].sort(sortByOrder);
}

/** อ่าน meta ปัจจุบัน */
export function getMeta(): CategoriesMeta {
  return { ...meta };
}

/** ========== Mutations ========== */

/** อัปเดต meta เฉพาะฟิลด์ที่ส่งมา */
export function setMeta(patch: Partial<CategoriesMeta>) {
  meta = {
    ...meta,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

/** ตั้งค่าการมองเห็น */
export function setVisible(id: UICategory["id"], visible: boolean) {
  state = state.map((x) => (x.id === id ? { ...x, visible } : x));
}

/** toggle การมองเห็น */
export function toggleVisible(id: UICategory["id"]) {
  state = state.map((x) =>
    x.id === id ? { ...x, visible: !(x.visible ?? true) } : x
  );
}

/** ลบแล้ว reindex order ให้ต่อเนื่อง */
export function remove(id: UICategory["id"]) {
  state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
}

/** จัดลำดับใหม่จาก payload orders แล้ว reindex ให้ต่อเนื่อง */
export function reorder(orders: { id: UICategory["id"]; order: number }[]) {
  const map = new Map(orders.map((o) => [o.id, o.order]));
  state = state
    .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
    .sort(sortByOrder)
    .map((x, i) => ({ ...x, order: i }));
}

/** เพิ่มใหม่หรือแก้ไข (ถ้าส่ง id ที่มีอยู่จะถือว่าแก้ไข) */
export function upsert(cat: Partial<UICategory>): UICategory {
  const existsIndex = state.findIndex((c) => c.id === cat.id);
  if (existsIndex >= 0) {
    // update
    const merged: UICategory = { ...state[existsIndex], ...cat } as UICategory;
    state = state.map((c, i) => (i === existsIndex ? merged : c)).sort(sortByOrder);
    return merged;
  } else {
    // create
    const nextId =
      typeof cat.id !== "undefined"
        ? cat.id
        : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

    const newItem: UICategory = {
      id: nextId,
      name: cat.name ?? "New Category",
      slug: cat.slug ?? String(nextId),
      image_url: cat.image_url ?? "/placeholder.png",
      visible: cat.visible ?? true,
      order: state.length, // ต่อท้าย
    };
    state = [...state, newItem].sort(sortByOrder);
    return newItem;
  }
}

/** สำหรับ dev: รีเซ็ตเป็นค่าเริ่มต้น */
export function reset() {
  state = seed.map((x, i) => ({ ...x, order: i }));
  meta = { ...seedMeta, updatedAt: new Date().toISOString() };
}

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
