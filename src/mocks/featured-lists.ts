// v.1.1.2 ================================================
// src/mocks/featured-lists.ts
// In-memory featured lists (mock)

export type FeaturedListItem = {
  productId: string | number;
  order: number; // ใช้จัดลำดับโชว์ (1..N)
};

export type FeaturedList = {
  key: string;            // เช่น "home_weekly", "home_cable"
  title: string;
  subtitle?: string;
  items: FeaturedListItem[];
  limit?: number;         // (optional) จำกัดจำนวนโชว์
};

// 👇 ตัวอย่างค่าเริ่มต้น: แก้ให้ตรงกับ mock products ของคุณ
const initialLists: FeaturedList[] = [
  {
    key: "home_weekly",
    title: "แนะนำประจำสัปดาห์",
    subtitle: "สินค้าเด่นที่คัดมาแล้ว",
    items: [
      { productId: 1, order: 1 },
      { productId: 2, order: 2 },
      { productId: 3, order: 3 },
      { productId: 4, order: 4 },
      { productId: 5, order: 5 },
      { productId: 6, order: 6 },
      { productId: 7, order: 7 },
      { productId: 8, order: 8 },
    ],
    limit: 24,
  },
  {
    key: "home_cable",
    title: "สายสื่อสารยอดนิยม",
    subtitle: "เลือกสายคุณภาพสำหรับงานเครือข่าย",
    items: [
      { productId: 3, order: 1 },
      { productId: 4, order: 2 },
      { productId: 5, order: 3 },
      { productId: 6, order: 4 },
    ],
  },
];

let FEATURED_LISTS = [...initialLists];

/* ============ helpers ============ */
function deepClone(list: FeaturedList): FeaturedList {
  return { ...list, items: list.items.map((i) => ({ ...i })) };
}

/** เรียงตาม order และรี-index ให้เป็น 1..N */
function normalizeItems(items: FeaturedListItem[]): FeaturedListItem[] {
  return [...items]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((it, idx) => ({ productId: it.productId, order: idx + 1 }));
}

/* ============ queries ============ */
export function getAllFeaturedLists(): FeaturedList[] {
  return FEATURED_LISTS.map((l) => deepClone(l));
}

export function getFeaturedListByKey(key: string): FeaturedList | undefined {
  const found = FEATURED_LISTS.find((l) => l.key === key);
  return found ? deepClone(found) : undefined;
}

/* ============ mutations ============ */
/** สร้างลิสต์ใหม่ (จะ error ถ้ามี key ซ้ำ) */
export function createFeaturedList(list: FeaturedList) {
  const exists = FEATURED_LISTS.some((l) => l.key === list.key);
  if (exists) {
    throw new Error(`featured list already exists for key="${list.key}"`);
  }
  const toSave: FeaturedList = {
    key: String(list.key),
    title: list.title ?? String(list.key),
    subtitle: list.subtitle,
    limit: typeof list.limit === "number" && list.limit > 0 ? list.limit : undefined,
    items: normalizeItems(list.items ?? []),
  };
  FEATURED_LISTS.push(deepClone(toSave));
  return getFeaturedListByKey(toSave.key)!;
}

/** อัปเดต/สร้างทับ (ถ้าไม่มี) */
export function upsertFeaturedList(list: FeaturedList) {
  const next: FeaturedList = {
    key: String(list.key),
    title: list.title ?? String(list.key),
    subtitle: list.subtitle,
    limit: typeof list.limit === "number" && list.limit > 0 ? list.limit : undefined,
    items: normalizeItems(list.items ?? []),
  };

  const idx = FEATURED_LISTS.findIndex((l) => l.key === next.key);
  if (idx >= 0) {
    FEATURED_LISTS[idx] = deepClone(next);
  } else {
    FEATURED_LISTS.push(deepClone(next));
  }
}

export function resetFeaturedLists() {
  FEATURED_LISTS = [...initialLists];
}

// v.1.1.2 ================================================

// // src/mocks/featured-lists.ts
// // In-memory featured lists (mock) — ใช้สำหรับเวอร์ชันแรก
// // หมายเหตุ: productId ในตัวอย่างให้ลองใส่ id ที่มีจริงใน mock products ของคุณ

// export type FeaturedListItem = {
//   productId: string | number;
//   order: number; // ใช้จัดลำดับโชว์
// };

// export type FeaturedList = {
//   key: string;            // เช่น "home_weekly", "home_cable"
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;         // (optional) จำกัดจำนวนโชว์
// };

// // 👇 ตัวอย่างค่าเริ่มต้น: แก้ให้ตรงกับ mock products ของคุณ
// const initialLists: FeaturedList[] = [
//   {
//     key: "home_weekly",
//     title: "แนะนำประจำสัปดาห์",
//     subtitle: "สินค้าเด่นที่คัดมาแล้ว",
//     items: [
//       { productId: 1, order: 1 },
//       { productId: 2, order: 2 },
//       { productId: 3, order: 3 },
//       { productId: 4, order: 4 },
//       { productId: 5, order: 5 },
//       { productId: 6, order: 6 },
//       { productId: 7, order: 7 },
//       { productId: 8, order: 8 },
//     ],
//     limit: 24,
//   },
//   {
//     key: "home_cable",
//     title: "สายสื่อสารยอดนิยม",
//     subtitle: "เลือกสายคุณภาพสำหรับงานเครือข่าย",
//     items: [
//       { productId: 3, order: 1 },
//       { productId: 4, order: 2 },
//       { productId: 5, order: 3 },
//       { productId: 6, order: 4 },
//     ],
//   },
// ];

// let FEATURED_LISTS = [...initialLists];

// // ===== helper fns =====
// export function getAllFeaturedLists(): FeaturedList[] {
//   // คืนแบบ clone เพื่อกันการแก้ไขอ้างอิงโดยไม่ตั้งใจ
//   return FEATURED_LISTS.map((l) => ({ ...l, items: l.items.map((i) => ({ ...i })) }));
// }

// export function getFeaturedListByKey(key: string): FeaturedList | undefined {
//   const found = FEATURED_LISTS.find((l) => l.key === key);
//   return found ? { ...found, items: found.items.map((i) => ({ ...i })) } : undefined;
// }

// // สำหรับอนาคต: อัพเดต/สร้างใหม่ได้ (admin page จะมาใช้)
// // (ยังไม่ผูกใน API รอบนี้ แต่ให้ไว้พร้อมใช้)
// export function upsertFeaturedList(list: FeaturedList) {
//   const idx = FEATURED_LISTS.findIndex((l) => l.key === list.key);
//   if (idx >= 0) FEATURED_LISTS[idx] = { ...list, items: [...list.items] };
//   else FEATURED_LISTS.push({ ...list, items: [...list.items] });
// }

// export function resetFeaturedLists() {
//   FEATURED_LISTS = [...initialLists];
// }
