// v.1.1.7 ===============================================
// src/app/api/mock/products/_store.ts

/** ===== Types ===== */
export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number; // 0..100
  image_url?: string;
  visible?: boolean;
  order: number;

  rating?: number;   // 0..5
  reviews?: number;  // จำนวนรีวิว

  category_id?: number | string;
  uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
};

export type ProductsMeta = {
  title: string;
  subtitle: string;
  updatedAt?: string;
};

/** ===== (NEW) Query types for admin listing ===== */
export type ProductQuery = {
  q?: string;
  category_id?: number | string;
  visible?: boolean;
  sort?:
    | "order"
    | "newest"
    | "price_asc"
    | "price_desc"
    | "discount_desc"
    | "rating_desc";
  page?: number;     // 1-based
  pageSize?: number; // e.g. 24/48/96
};

/** ===== Seed from legacy-like sample ===== */
const seedRows = [
  { id: 1, name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156, category_id: 2, uom: "ST." },
  { id: 2, name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129", discount: "80%", rating: 4.6, reviews: 234, category_id: 9, uom: "EA." },
  { id: 3, name: "RG-6 Coaxial Cable 305m",             brand: "GERMANYRACK", price: 4540, image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03", discount: "60%", rating: 4.5, reviews: 189, category_id: 6, uom: "ST." },
  { id: 4, name: "Solar Cable 4mm² PV Wire 100m",       brand: "LINK", price: 4860, image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03", discount: "80%", rating: 4.7, reviews: 145, category_id: 7, uom: "M." },
  { id: 5, name: "Telephone Cable 4-Pair Indoor 305m",  brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg", sku: "AM-2220-02", discount: "60%", rating: 4.4, reviews: 98,  category_id: 3, uom: "ST." },
  { id: 6, name: "19'' Server Rack Cabinet 42U",        brand: "LINK", price: 2000, image: "/assets/server-rack-19inch.jpg", sku: "AM-3032", discount: "90%", rating: 4.9, reviews: 87,  category_id: 10, uom: "EA." },
  { id: 7, name: "US-9035 CAT 5E UTP Cable Indoor 305m",brand: "LINK", price: 1770, image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A", discount: "60%", rating: 4.7, reviews: 178, category_id: 1, uom: "PC." },
  { id: 8, name: "UT-0216 Fiber Media Converter RJ45",  brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A", discount: "0%",  rating: 4.6, reviews: 124, category_id: 9, uom: "PC." },
];

const parsePercent = (text?: string) => {
  if (!text) return 0;
  const m = String(text).match(/(\d+)(\.\d+)?/);
  return m ? Math.round(Number(m[0])) : 0;
};

/** ===== In-memory state ===== */
let state: UIProduct[] = seedRows.map((r, i) => ({
  id: r.id,
  name: r.name,
  brand: r.brand,
  sku: r.sku,
  price: r.price,
  discountPercent: parsePercent((r as any).discount),
  image_url: (r as any).image || "/placeholder.png",
  visible: true,
  order: i,
  rating: (r as any).rating,
  reviews: (r as any).reviews,
  category_id: (r as any).category_id,
  uom: (r as any).uom,
}));

const seedMeta: ProductsMeta = {
  title: "สินค้าทั้งหมด",
  subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
  updatedAt: new Date().toISOString(),
};

let meta: ProductsMeta = { ...seedMeta };

/** ===== Helpers ===== */
const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);
const coerceId = (v: any) => (isNaN(Number(v)) ? v : Number(v));

/** (NEW) full-text แบบง่ายๆ: แยกคำแล้วเช็ค name/sku/brand */
function matchesSearch(p: UIProduct, q?: string) {
  if (!q) return true;
  const hay = `${p.name ?? ""} ${p.sku ?? ""} ${p.brand ?? ""}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((kw) => hay.includes(kw));
}

/** (NEW) จัดเรียงตามค่า sort */
function applySort(list: UIProduct[], sort: ProductQuery["sort"]) {
  const s = sort ?? "order";
  const arr = [...list];
  switch (s) {
    case "price_asc":
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price_desc":
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "discount_desc":
      return arr.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    case "rating_desc":
      return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "newest":
      // ไม่มี createdAt จริง ใช้ id แบบตัวเลขแทน (ถ้าเป็น string จะคงลำดับเดิม)
      return arr.sort((a, b) => {
        const an = typeof a.id === "number" ? a.id : 0;
        const bn = typeof b.id === "number" ? b.id : 0;
        return bn - an;
      });
    case "order":
    default:
      return arr.sort(sortByOrder);
  }
}

/** ===== Queries ===== */
export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
  const includeHidden = opts?.includeHidden ?? true;
  const list = includeHidden ? state : state.filter((c) => c.visible !== false);
  return [...list].sort(sortByOrder);
}

export function getMeta(): ProductsMeta {
  return { ...meta };
}

/** (NEW) ค้นหา/ฟิลเตอร์ + แบ่งหน้า */
export function queryProducts(params: ProductQuery) {
  const {
    q,
    category_id,
    visible,
    sort,
    page = 1,
    pageSize = 24,
  } = params ?? {};

  let list = [...state];

  // ฟิลเตอร์แสดง/ซ่อน
  if (typeof visible === "boolean") {
    list = list.filter((x) => (x.visible ?? true) === visible);
  }

  // ฟิลเตอร์หมวด
  if (typeof category_id !== "undefined") {
    const cid = coerceId(category_id);
    list = list.filter((x) => x.category_id === cid);
  }

  // ค้นหา
  if (q && q.trim()) {
    list = list.filter((p) => matchesSearch(p, q));
  }

  // เรียง
  list = applySort(list, sort);

  // แบ่งหน้า
  const p = Math.max(1, Math.floor(page));
  const ps = Math.min(200, Math.max(1, Math.floor(pageSize))); // guard
  const total = list.length;
  const start = (p - 1) * ps;
  const items = list.slice(start, start + ps);

  return { items, total, page: p, pageSize: ps };
}

/** ===== Mutations ===== */
export function setMeta(patch: Partial<ProductsMeta>) {
  meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
}

export function setVisible(id: UIProduct["id"], visible: boolean) {
  state = state.map((x) => (x.id === id ? { ...x, visible } : x));
}

export function toggleVisible(id: UIProduct["id"]) {
  state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
}

export function remove(id: UIProduct["id"]) {
  state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
}

export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
  const map = new Map(orders.map((o) => [o.id, o.order]));
  state = state
    .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
    .sort(sortByOrder)
    .map((x, i) => ({ ...x, order: i }));
}

/** create/update */
export function upsert(p: Partial<UIProduct>): UIProduct {
  const idx = state.findIndex((c) => c.id === p.id);
  if (idx >= 0) {
    const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
    state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
    return merged;
  } else {
    const nextId =
      typeof p.id !== "undefined"
        ? p.id
        : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

    const newItem: UIProduct = {
      id: nextId,
      name: p.name ?? "New Product",
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      price: typeof p.price === "number" ? p.price : 0,
      discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
      image_url: p.image_url ?? "/placeholder.png",
      visible: p.visible ?? false,
      order: state.length,
      rating: typeof p.rating === "number" ? p.rating : undefined,
      reviews: typeof p.reviews === "number" ? p.reviews : undefined,
      category_id: p.category_id,
      uom: p.uom,
    };
    state = [...state, newItem].sort(sortByOrder);
    return newItem;
  }
}

export function reset() {
  state = seedRows.map((r, i) => ({
    id: r.id,
    name: r.name,
    brand: r.brand,
    sku: r.sku,
    price: r.price,
    discountPercent: parsePercent((r as any).discount),
    image_url: (r as any).image || "/placeholder.png",
    visible: true,
    order: i,
    rating: (r as any).rating,
    reviews: (r as any).reviews,
    category_id: (r as any).category_id,
    uom: (r as any).uom,
  }));
  meta = { ...seedMeta, updatedAt: new Date().toISOString() };
}

// v.1.1.7 ===============================================

// v.1.1.6 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // FIBER OPTIC System
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//     uom: "M.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// function toNumber(v: any): number | undefined {
//   if (v === "" || v == null) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) ? n : undefined;
// }
// function clamp(n: number, lo: number, hi: number) {
//   return Math.min(hi, Math.max(lo, n));
// }
// function defined<T>(v: T | undefined | null): v is T {
//   return v !== undefined && v !== null;
// }

// /** ล้าง/แปลงค่าที่ส่งเข้ามาก่อน merge/create */
// function normalizePartial(p: Partial<UIProduct>): Partial<UIProduct> {
//   const price = toNumber(p.price);
//   const discountPercent = toNumber(p.discountPercent);
//   const ratingNum = toNumber((p as any).rating);
//   const reviewsNum = toNumber((p as any).reviews);

//   const uom =
//     typeof p.uom === "string" ? (p.uom.trim() === "" ? undefined : p.uom.trim()) : undefined;

//   const image_url =
//     typeof p.image_url === "string" ? (p.image_url.trim() === "" ? undefined : p.image_url) : undefined;

//   // category_id: คงชนิด string|number ตามที่ส่งมา (ถ้าว่าง → undefined)
//   const category_id =
//     (p as any).category_id === "" || (p as any).category_id == null
//       ? undefined
//       : (p as any).category_id;

//   return {
//     ...(typeof p.name === "string" ? { name: p.name } : {}),
//     ...(typeof p.brand === "string" ? { brand: p.brand } : {}),
//     ...(typeof p.sku === "string" ? { sku: p.sku } : {}),
//     ...(defined(price) ? { price } : {}),
//     ...(defined(discountPercent) ? { discountPercent: clamp(Math.round(discountPercent), 0, 100) } : {}),
//     ...(defined(image_url) ? { image_url } : {}),
//     ...(typeof p.visible === "boolean" ? { visible: p.visible } : {}),

//     ...(defined(ratingNum)
//       ? { rating: clamp(Number(ratingNum.toFixed(1)), 0, 5) }
//       : {}),
//     ...(defined(reviewsNum)
//       ? { reviews: Math.max(0, Math.floor(reviewsNum)) }
//       : {}),
//     ...(defined(category_id) ? { category_id } : {}),
//     ...(defined(uom) ? { uom } : {}),
//   };
// }

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const cleaned = normalizePartial(p);

//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     // update (merge เฉพาะฟิลด์ที่ส่งมา)
//     const merged: UIProduct = { ...state[idx], ...cleaned } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     // create
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: (cleaned.name as string) ?? "New Product",
//       brand: cleaned.brand ?? "",
//       sku: cleaned.sku ?? "",
//       price: typeof cleaned.price === "number" ? cleaned.price : 0,
//       discountPercent:
//         typeof cleaned.discountPercent === "number" ? cleaned.discountPercent : 0,
//       image_url: cleaned.image_url ?? "/placeholder.png",
//       visible: typeof cleaned.visible === "boolean" ? cleaned.visible : false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof cleaned.rating === "number" ? cleaned.rating : undefined,
//       reviews: typeof cleaned.reviews === "number" ? cleaned.reviews : undefined,
//       category_id: cleaned.category_id,
//       uom: cleaned.uom,
//     };

//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.6 ===============================================

// v.1.1.5 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   category_id?: number | string;
//   uom?: string;      // <<< หน่วยสินค้า เช่น "ST.", "EA.", "PC."
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // FIBER OPTIC System
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//     uom: "M.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id,
//       uom: p.uom, // <<< รองรับ uom ตอนสร้าง/แก้ไข
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.5 ===============================================

// v.1.1.4 ===============================================
// // src/app/api/mock/products/_store.ts
// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   // เพิ่มเพื่อโชว์บนการ์ด
//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว

//   // ผูกกับหมวดหมู่ (มาจาก mock categories)
//   category_id?: number | string;
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample =====
//  *  หมายเหตุ: กำหนด category_id ให้สินค้าทุกตัว (อิง mock categories ที่คุณมีอยู่ id 1..12)
//  *  และใส่ rating/reviews ให้เห็นผลในหน้าแอดมิน
//  */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "COMMSCOPE",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     category_id: 2, // ตัวอย่าง: FIBER OPTIC System
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     category_id: 9, // NETWORKING System
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANYRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     category_id: 6, // COAXIAL (RG) System
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     category_id: 7, // SOLAR CABLE
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     category_id: 3, // Telephone CABLE
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     category_id: 10, // GERMANY RACK (หรือปรับตามที่ต้องการ)
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     category_id: 1, // LAN (UTP) System
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     category_id: 9, // NETWORKING System
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   category_id: (r as any).category_id,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       category_id: p.category_id, // <<< เก็บ id ของหมวดหมู่
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     category_id: (r as any).category_id,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v1.1.4 ================================================


// v.1.1.3 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;
//   rating?: number;
//   reviews?: number;
//   uom?: string; // ⭐ หน่วยสินค้า
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   {
//     id: 1,
//     name: "Fiber Optic Cable Single Mode 305m",
//     brand: "LINK",
//     price: 2160,
//     image: "/assets/fiber-optic-cable.jpg",
//     sku: "AM-2120-02XG",
//     discount: "60%",
//     rating: 4.8,
//     reviews: 156,
//     uom: "ST.",
//   },
//   {
//     id: 2,
//     name: "24-Port Gigabit Network Switch",
//     brand: "COMMSCOPE",
//     price: 8530,
//     image: "/assets/network-switch-professional.jpg",
//     sku: "AM-2129",
//     discount: "80%",
//     rating: 4.6,
//     reviews: 234,
//     uom: "EA.",
//   },
//   {
//     id: 3,
//     name: "RG-6 Coaxial Cable 305m",
//     brand: "GERMANRACK",
//     price: 4540,
//     image: "/assets/coaxial-cable-reel.jpg",
//     sku: "AM-2162-03",
//     discount: "60%",
//     rating: 4.5,
//     reviews: 189,
//     uom: "ST.",
//   },
//   {
//     id: 4,
//     name: "Solar Cable 4mm² PV Wire 100m",
//     brand: "LINK",
//     price: 4860,
//     image: "/assets/solar-cable-red.jpg",
//     sku: "AM-2166-03",
//     discount: "80%",
//     rating: 4.7,
//     reviews: 145,
//     uom: "ST.",
//   },
//   {
//     id: 5,
//     name: "Telephone Cable 4-Pair Indoor 305m",
//     brand: "COMMSCOPE",
//     price: 1470,
//     image: "/assets/telephone-cable.jpg",
//     sku: "AM-2220-02",
//     discount: "60%",
//     rating: 4.4,
//     reviews: 98,
//     uom: "ST.",
//   },
//   {
//     id: 6,
//     name: "19'' Server Rack Cabinet 42U",
//     brand: "LINK",
//     price: 2000,
//     image: "/assets/server-rack-19inch.jpg",
//     sku: "AM-3032",
//     discount: "90%",
//     rating: 4.9,
//     reviews: 87,
//     uom: "EA.",
//   },
//   {
//     id: 7,
//     name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//     brand: "LINK",
//     price: 1770,
//     image: "/assets/lan-cat5e-box.jpg",
//     sku: "AM-3602A",
//     discount: "60%",
//     rating: 4.7,
//     reviews: 178,
//     uom: "PC.",
//   },
//   {
//     id: 8,
//     name: "UT-0216 Fiber Media Converter RJ45",
//     brand: "COMMSCOPE",
//     price: 3108,
//     image: "/assets/fiber-media-converter.jpg",
//     sku: "AM-3620A",
//     discount: "0%",
//     rating: 4.6,
//     reviews: 124,
//     uom: "PC.",
//   },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating,
//   reviews: (r as any).reviews,
//   uom: (r as any).uom,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : undefined,
//       reviews: typeof p.reviews === "number" ? p.reviews : undefined,
//       uom: p.uom ?? "", // ⭐ เก็บหน่วย
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating,
//     reviews: (r as any).reviews,
//     uom: (r as any).uom,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;

//   // ⭐️ เพิ่มฟิลด์สำหรับ UI ด้านหน้า
//   rating?: number;   // 0..5
//   reviews?: number;  // จำนวนรีวิว
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample =====
//  *  (ใส่ rating/reviews ให้สอดคล้องกับหน้า frontend)
//  */
// const seedRows = [
//   { id: 1,  name: "Fiber Optic Cable Single Mode 305m",  brand: "COMMSCOPE", price: 2160, image: "/assets/fiber-optic-cable.jpg",       sku: "AM-2120-02XG", discount: "60%", rating: 4.8, reviews: 156 },
//   { id: 2,  name: "24-Port Gigabit Network Switch",       brand: "COMMSCOPE", price: 8530, image: "/assets/network-switch-professional.jpg", sku: "AM-2129",      discount: "80%", rating: 4.6, reviews: 234 },
//   { id: 3,  name: "RG-6 Coaxial Cable 305m",              brand: "COMMSCOPE", price: 4540, image: "/assets/coaxial-cable-reel.jpg",     sku: "AM-2162-03",   discount: "60%", rating: 4.5, reviews: 189 },
//   { id: 4,  name: "Solar Cable 4mm² PV Wire 100m",        brand: "COMMSCOPE", price: 4860, image: "/assets/solar-cable-red.jpg",        sku: "AM-2166-03",   discount: "80%", rating: 4.7, reviews: 145 },
//   { id: 5,  name: "Telephone Cable 4-Pair Indoor 305m",   brand: "COMMSCOPE", price: 1470, image: "/assets/telephone-cable.jpg",        sku: "AM-2220-02",   discount: "60%", rating: 4.4, reviews: 98  },
//   { id: 6,  name: "19'' Server Rack Cabinet 42U",         brand: "COMMSCOPE", price: 2000, image: "/assets/server-rack-19inch.jpg",     sku: "AM-3032",      discount: "90%", rating: 4.9, reviews: 87  },
//   { id: 7,  name: "US-9035 CAT 5E UTP Cable Indoor 305m", brand: "COMMSCOPE", price: 1770, image: "/assets/lan-cat5e-box.jpg",          sku: "AM-3602A",     discount: "60%", rating: 4.7, reviews: 178 },
//   { id: 8,  name: "UT-0216 Fiber Media Converter RJ45",   brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg",  sku: "AM-3620A",     discount: "0%",  rating: 4.6, reviews: 124 },
// ];

// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent((r as any).discount),
//   image_url: (r as any).image || "/placeholder.png",
//   visible: true,
//   order: i,
//   rating: (r as any).rating ?? 0,
//   reviews: (r as any).reviews ?? 0,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state
//     .map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     // update
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     // create
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//       rating: typeof p.rating === "number" ? p.rating : 0,
//       reviews: typeof p.reviews === "number" ? p.reviews : 0,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id,
//     name: r.name,
//     brand: r.brand,
//     sku: r.sku,
//     price: r.price,
//     discountPercent: parsePercent((r as any).discount),
//     image_url: (r as any).image || "/placeholder.png",
//     visible: true,
//     order: i,
//     rating: (r as any).rating ?? 0,
//     reviews: (r as any).reviews ?? 0,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }

// v.1.1.2 ===============================================

// // src/app/api/mock/products/_store.ts

// /** ===== Types ===== */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order: number;
// };

// export type ProductsMeta = {
//   title: string;
//   subtitle: string;
//   updatedAt?: string;
// };

// /** ===== Seed from legacy-like sample ===== */
// const seedRows = [
//   { id: 1,  name: "Fiber Optic Cable Single Mode 305m", brand: "COMMSCOPE", price: 2160,  image: "/assets/fiber-optic-cable.jpg", sku: "AM-2120-02XG", discount: "60%" },
//   { id: 2,  name: "24-Port Gigabit Network Switch",      brand: "COMMSCOPE", price: 8530,  image: "/assets/network-switch-professional.jpg", sku: "AM-2129",      discount: "80%" },
//   { id: 3,  name: "RG-6 Coaxial Cable 305m",   brand: "COMMSCOPE", price: 4540,  image: "/assets/coaxial-cable-reel.jpg", sku: "AM-2162-03",   discount: "60%" },
//   { id: 4,  name: "Solar Cable 4mm² PV Wire 100m",   brand: "COMMSCOPE", price: 4860,  image: "/assets/solar-cable-red.jpg", sku: "AM-2166-03",   discount: "80%" },
//   { id: 5,  name: "Telephone Cable 4-Pair Indoor 305m",   brand: "COMMSCOPE", price: 1470,  image: "/assets/telephone-cable.jpg", sku: "AM-2220-02",   discount: "60%" },
//   { id: 6,  name: "19'' Server Rack Cabinet 42U",      brand: "COMMSCOPE", price: 2000,   image: "/assets/server-rack-19inch.jpg", sku: "AM-3032",      discount: "90%" },
//   { id: 7,  name: "US-9035 CAT 5E UTP Cable Indoor 305m",     brand: "COMMSCOPE", price: 1770,  image: "/assets/lan-cat5e-box.jpg", sku: "AM-3602A",     discount: "60%" },
//   { id: 8,  name: "UT-0216 Fiber Media Converter RJ45",     brand: "COMMSCOPE", price: 3108, image: "/assets/fiber-media-converter.jpg", sku: "AM-3620A",     discount: "0%" },
  
// ];


// const parsePercent = (text?: string) => {
//   if (!text) return 0;
//   const m = String(text).match(/(\d+)(\.\d+)?/);
//   return m ? Math.round(Number(m[0])) : 0;
// };

// /** ===== In-memory state ===== */
// let state: UIProduct[] = seedRows.map((r, i) => ({
//   id: r.id,
//   name: r.name,
//   brand: r.brand,
//   sku: r.sku,
//   price: r.price,
//   discountPercent: parsePercent(r.discount),
//   image_url: r.image || "/placeholder.png",
//   visible: true,
//   order: i,
// }));

// const seedMeta: ProductsMeta = {
//   title: "สินค้าทั้งหมด",
//   subtitle: "ตัวอย่างข้อมูลจาก mock API (in-memory)",
//   updatedAt: new Date().toISOString(),
// };

// let meta: ProductsMeta = { ...seedMeta };

// /** ===== Helpers ===== */
// const sortByOrder = (a: UIProduct, b: UIProduct) => (a.order ?? 0) - (b.order ?? 0);

// /** ===== Queries ===== */
// export function getAll(opts?: { includeHidden?: boolean }): UIProduct[] {
//   const includeHidden = opts?.includeHidden ?? true;
//   const list = includeHidden ? state : state.filter((c) => c.visible !== false);
//   return [...list].sort(sortByOrder);
// }

// export function getMeta(): ProductsMeta {
//   return { ...meta };
// }

// /** ===== Mutations ===== */
// export function setMeta(patch: Partial<ProductsMeta>) {
//   meta = { ...meta, ...patch, updatedAt: new Date().toISOString() };
// }

// export function setVisible(id: UIProduct["id"], visible: boolean) {
//   state = state.map((x) => (x.id === id ? { ...x, visible } : x));
// }

// export function toggleVisible(id: UIProduct["id"]) {
//   state = state.map((x) => (x.id === id ? { ...x, visible: !(x.visible ?? true) } : x));
// }

// export function remove(id: UIProduct["id"]) {
//   state = state.filter((x) => x.id !== id).sort(sortByOrder).map((x, i) => ({ ...x, order: i }));
// }

// export function reorder(orders: { id: UIProduct["id"]; order: number }[]) {
//   const map = new Map(orders.map((o) => [o.id, o.order]));
//   state = state.map((x) => ({ ...x, order: map.get(x.id) ?? x.order }))
//     .sort(sortByOrder)
//     .map((x, i) => ({ ...x, order: i }));
// }

// /** create/update */
// export function upsert(p: Partial<UIProduct>): UIProduct {
//   const idx = state.findIndex((c) => c.id === p.id);
//   if (idx >= 0) {
//     const merged: UIProduct = { ...state[idx], ...p } as UIProduct;
//     state = state.map((c, i) => (i === idx ? merged : c)).sort(sortByOrder);
//     return merged;
//   } else {
//     const nextId =
//       typeof p.id !== "undefined"
//         ? p.id
//         : Math.max(0, ...state.map((c) => (typeof c.id === "number" ? c.id : 0))) + 1;

//     const newItem: UIProduct = {
//       id: nextId,
//       name: p.name ?? "New Product",
//       brand: p.brand ?? "",
//       sku: p.sku ?? "",
//       price: typeof p.price === "number" ? p.price : 0,
//       discountPercent: typeof p.discountPercent === "number" ? p.discountPercent : 0,
//       image_url: p.image_url ?? "/placeholder.png",
//       visible: p.visible ?? false, // default ซ่อนก่อน
//       order: state.length,
//     };
//     state = [...state, newItem].sort(sortByOrder);
//     return newItem;
//   }
// }

// export function reset() {
//   state = seedRows.map((r, i) => ({
//     id: r.id, name: r.name, brand: r.brand, sku: r.sku, price: r.price,
//     discountPercent: parsePercent(r.discount), image_url: r.image || "/placeholder.png", visible: true, order: i,
//   }));
//   meta = { ...seedMeta, updatedAt: new Date().toISOString() };
// }
