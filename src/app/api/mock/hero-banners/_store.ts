// v.1.1.2 ================================================
// /src/app/api/mock/hero-banners/_store.ts

/* ========= In-memory store & helpers for Hero Banners ========= */

export const uploadDirFs = "/public/uploads/banners";   // path ฝั่งไฟล์จริง (สำหรับ UI บอกผู้ใช้)
export const publicPath  = "/uploads/banners";          // path แบบ public ที่หน้าเว็บใช้

/* ========= Types ========= */
export type AlignX = "left" | "center" | "right";
export type AlignY = "top" | "center" | "bottom";
export type LayoutMode = "image" | "overlay" | "split";
export type CTA = { label: string; href: string; variant?: "primary" | "outline" | "ghost" };

export type HeroBanner = {
  id: string;
  isActive: boolean;
  order: number;

  // scheduling
  startAt?: string; // ISO
  endAt?: string;   // ISO

  // visuals
  layoutMode: LayoutMode;
  imageUrlDesktop: string; // e.g. /uploads/banners/xxx-desktop.jpg
  imageUrlMobile?: string; // e.g. /uploads/banners/xxx-mobile.jpg

  // overlay/split options
  title?: string;
  subtitle?: string;
  textAlign?: { x: AlignX; y: AlignY }; // overlay/split
  overlay?: { color: string; opacity: number }; // overlay only

  // actions
  ctas?: CTA[];
  linkUrl?: string;

  // misc
  altText?: string;
  locale?: string;
};

export type PostBody = Partial<HeroBanner> & { id?: string; imageUrlDesktop?: string };

/* ========= Seed data (3 รายการ: image / overlay / split) ========= */
let BANNERS: HeroBanner[] = [
  // 1) pure image
  {
    id: "clearance-2024-week1",
    isActive: true,
    order: 0,
    layoutMode: "image",
    imageUrlDesktop: `${publicPath}/clearance-2024-desktop.jpg`,
    imageUrlMobile:  `${publicPath}/clearance-2024-mobile.jpg`,
    linkUrl: "/clearance",
    altText: "Clearance 2024 up to 90% off",
  },

  // 2) overlay
  {
    id: "brand-week-overlay",
    isActive: true,
    order: 1,
    layoutMode: "overlay",
    imageUrlDesktop: `${publicPath}/brand-week-desktop.jpg`,
    title: "Brand Week",
    subtitle: "อุปกรณ์เครือข่ายแบรนด์ดัง ลดเพิ่มอีก 10%",
    textAlign: { x: "left", y: "bottom" },
    overlay: { color: "#000000", opacity: 0.35 },
    ctas: [{ label: "ช้อปเลย", href: "/brands", variant: "primary" }],
    altText: "Brand week overlay banner",
  },

  // 3) split
  {
    id: "new-arrivals-split",
    isActive: false,
    order: 2,
    layoutMode: "split",
    imageUrlDesktop: `${publicPath}/new-arrivals-desktop.jpg`,
    title: "New Arrivals",
    subtitle: "สินค้าเข้าใหม่ประจำสัปดาห์",
    textAlign: { x: "right", y: "center" },
    ctas: [{ label: "ดูทั้งหมด", href: "/new-arrivals", variant: "outline" }],
    altText: "New arrivals split banner",
  },
];

/* ========= Utilities ========= */
const now = () => Date.now();
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const toInt = (v: unknown, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : def;
};

const isWithin = (start?: string, end?: string) => {
  const t = now();
  const sOk = !start || (Date.parse(start) <= t);
  const eOk = !end || (t < Date.parse(end));
  return sOk && eOk;
};
export const activeNow = (b: HeroBanner) => (b.isActive ?? false) && isWithin(b.startAt, b.endAt);
export const sortBanners = (list: HeroBanner[]) =>
  [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const normalize = (p: Partial<HeroBanner>): Partial<HeroBanner> => {
  const out: Partial<HeroBanner> = { ...p };

  if (typeof out.order === "number") out.order = Math.max(0, Math.floor(out.order));
  if (out.textAlign) {
    const x: AlignX = ["left", "center", "right"].includes(out.textAlign.x as any)
      ? (out.textAlign.x as AlignX)
      : "left";
    const y: AlignY = ["top", "center", "bottom"].includes(out.textAlign.y as any)
      ? (out.textAlign.y as AlignY)
      : "center";
    out.textAlign = { x, y };
  }
  if (out.overlay) {
    out.overlay = {
      color: typeof out.overlay.color === "string" && out.overlay.color ? out.overlay.color : "#000000",
      opacity: typeof out.overlay.opacity === "number" ? clamp01(out.overlay.opacity) : 0.4,
    };
  }
  if (out.layoutMode !== "overlay" && out.layoutMode !== "split" && out.layoutMode !== "image") {
    out.layoutMode = "image";
  }
  return out;
};

/* ========= CRUD-like helpers ========= */
export const listAll = () => sortBanners(BANNERS);
export const listActive = () => sortBanners(BANNERS).filter(activeNow);
export const getById = (id: string) => BANNERS.find((x) => x.id === id) || null;

export const createHero = (body: PostBody): HeroBanner => {
  const id =
    (typeof body.id === "string" && body.id.trim()) ||
    `banner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const base: HeroBanner = {
    id,
    isActive: Boolean(body.isActive ?? true),
    order: toInt(body.order ?? BANNERS.length, BANNERS.length),
    startAt: body.startAt,
    endAt: body.endAt,
    layoutMode: (body.layoutMode as LayoutMode) || "image",
    imageUrlDesktop:
      body.imageUrlDesktop && body.imageUrlDesktop.trim()
        ? body.imageUrlDesktop
        : `${publicPath}/sample-desktop.jpg`,
    imageUrlMobile: body.imageUrlMobile,
    title: body.title,
    subtitle: body.subtitle,
    textAlign: body.textAlign
      ? { x: body.textAlign.x as AlignX, y: body.textAlign.y as AlignY }
      : undefined,
    overlay: body.overlay
      ? { color: body.overlay.color || "#000000", opacity: clamp01(Number(body.overlay.opacity ?? 0.4)) }
      : undefined,
    ctas: Array.isArray(body.ctas)
      ? body.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant }))
      : [],
    linkUrl: body.linkUrl,
    altText: body.altText,
    locale: body.locale,
  };

  const created = normalize(base) as HeroBanner;
  if (BANNERS.some((b) => b.id === created.id)) {
    throw new Error(`duplicate id "${created.id}"`);
  }
  BANNERS.push(created);
  return created;
};

export const updateHeroPartial = (id: string, patch: Partial<HeroBanner>) => {
  const found = BANNERS.find((x) => x.id === id);
  if (!found) return null;

  const next: HeroBanner = { ...found, ...normalize(patch) } as HeroBanner;

  if (patch.ctas) {
    next.ctas = Array.isArray(patch.ctas)
      ? patch.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant }))
      : [];
  }
  if (patch.overlay && typeof patch.overlay.opacity === "number") {
    next.overlay = { ...(next.overlay || {}), ...patch.overlay, opacity: clamp01(patch.overlay.opacity) };
  }

  const idx = BANNERS.findIndex((x) => x.id === id);
  BANNERS[idx] = next;
  return next;
};

export const removeById = (id: string) => {
  const before = BANNERS.length;
  BANNERS = BANNERS.filter((b) => b.id !== id);
  return BANNERS.length !== before;
};

/* ========= Bulk reorder ========= */
/**
 * รับรายการ id+order แล้วอัปเดตค่าลง store
 * - ตรวจสอบว่า id ทุกตัวมีอยู่จริง
 * - เซฟด้วย order ที่ส่งมา (sanitize เป็นจำนวนเต็มและไม่ติดลบ)
 * - คืนลิสต์ล่าสุดที่ sort แล้ว (และ normalize order ให้ติดกัน 0..N-1 เพื่อความคงที่)
 */
export const bulkReorder = (pairs: { id: string; order: number }[]): HeroBanner[] => {
  if (!Array.isArray(pairs)) throw new Error("payload must be an array");

  const idsInStore = new Set(BANNERS.map((b) => b.id));
  for (const p of pairs) {
    if (!p || typeof p.id !== "string" || !idsInStore.has(p.id)) {
      throw new Error(`id not found: "${p?.id}"`);
    }
  }

  // ทำเป็น map สำหรับ lookup เร็ว ๆ
  const orderMap = new Map<string, number>(
    pairs.map((p) => [p.id, Math.max(0, toInt(p.order, 0))])
  );

  // อัปเดตค่า order เฉพาะตัวที่มีใน payload
  BANNERS = BANNERS.map((b) =>
    orderMap.has(b.id) ? { ...b, order: orderMap.get(b.id)! } : b
  );

  // จัดเรียง + normalize order ให้เป็น 0..N-1
  BANNERS = sortBanners(BANNERS).map((b, i) => ({ ...b, order: i }));

  return listAll();
};

// v.1.1.2 ================================================

// // /src/app/api/mock/hero-banners/_store.ts

// /* ========= In-memory store & helpers for Hero Banners ========= */

// export const uploadDirFs = "/public/uploads/banners";   // path ฝั่งไฟล์จริง (สำหรับ UI บอกผู้ใช้)
// export const publicPath  = "/uploads/banners";          // path แบบ public ที่หน้าเว็บใช้

// /* ========= Types ========= */
// export type AlignX = "left" | "center" | "right";
// export type AlignY = "top" | "center" | "bottom";
// export type LayoutMode = "image" | "overlay" | "split";
// export type CTA = { label: string; href: string; variant?: "primary" | "outline" | "ghost" };

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;

//   // scheduling
//   startAt?: string; // ISO
//   endAt?: string;   // ISO

//   // visuals
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string; // e.g. /uploads/banners/xxx-desktop.jpg
//   imageUrlMobile?: string; // e.g. /uploads/banners/xxx-mobile.jpg

//   // overlay/split options
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY }; // overlay/split
//   overlay?: { color: string; opacity: number }; // overlay only

//   // actions
//   ctas?: CTA[];
//   linkUrl?: string;

//   // misc
//   altText?: string;
//   locale?: string;
// };

// export type PostBody = Partial<HeroBanner> & { id?: string; imageUrlDesktop?: string };

// /* ========= Seed data (3 รายการ: image / overlay / split) ========= */
// let BANNERS: HeroBanner[] = [
//   // 1) pure image
//   {
//     id: "clearance-2024-week1",
//     isActive: true,
//     order: 0,
//     layoutMode: "image",
//     imageUrlDesktop: `${publicPath}/clearance-2024-desktop.jpg`,
//     imageUrlMobile:  `${publicPath}/clearance-2024-mobile.jpg`,
//     linkUrl: "/clearance",
//     altText: "Clearance 2024 up to 90% off",
//   },

//   // 2) overlay
//   {
//     id: "brand-week-overlay",
//     isActive: true,
//     order: 1,
//     layoutMode: "overlay",
//     imageUrlDesktop: `${publicPath}/brand-week-desktop.jpg`,
//     title: "Brand Week",
//     subtitle: "อุปกรณ์เครือข่ายแบรนด์ดัง ลดเพิ่มอีก 10%",
//     textAlign: { x: "left", y: "bottom" },
//     overlay: { color: "#000000", opacity: 0.35 },
//     ctas: [{ label: "ช้อปเลย", href: "/brands", variant: "primary" }],
//     altText: "Brand week overlay banner",
//   },

//   // 3) split
//   {
//     id: "new-arrivals-split",
//     isActive: false,
//     order: 2,
//     layoutMode: "split",
//     imageUrlDesktop: `${publicPath}/new-arrivals-desktop.jpg`,
//     title: "New Arrivals",
//     subtitle: "สินค้าเข้าใหม่ประจำสัปดาห์",
//     textAlign: { x: "right", y: "center" },
//     ctas: [{ label: "ดูทั้งหมด", href: "/new-arrivals", variant: "outline" }],
//     altText: "New arrivals split banner",
//   },
// ];

// /* ========= Utilities ========= */
// const now = () => Date.now();
// const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
// const toInt = (v: unknown, def: number) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? Math.floor(n) : def;
// };

// const isWithin = (start?: string, end?: string) => {
//   const t = now();
//   const sOk = !start || (Date.parse(start) <= t);
//   const eOk = !end || (t < Date.parse(end));
//   return sOk && eOk;
// };
// export const activeNow = (b: HeroBanner) => (b.isActive ?? false) && isWithin(b.startAt, b.endAt);
// export const sortBanners = (list: HeroBanner[]) =>
//   [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// const normalize = (p: Partial<HeroBanner>): Partial<HeroBanner> => {
//   const out: Partial<HeroBanner> = { ...p };

//   if (typeof out.order === "number") out.order = Math.max(0, Math.floor(out.order));
//   if (out.textAlign) {
//     const x: AlignX = ["left", "center", "right"].includes(out.textAlign.x as any)
//       ? (out.textAlign.x as AlignX)
//       : "left";
//     const y: AlignY = ["top", "center", "bottom"].includes(out.textAlign.y as any)
//       ? (out.textAlign.y as AlignY)
//       : "center";
//     out.textAlign = { x, y };
//   }
//   if (out.overlay) {
//     out.overlay = {
//       color: typeof out.overlay.color === "string" && out.overlay.color ? out.overlay.color : "#000000",
//       opacity: typeof out.overlay.opacity === "number" ? clamp01(out.overlay.opacity) : 0.4,
//     };
//   }
//   if (out.layoutMode !== "overlay" && out.layoutMode !== "split" && out.layoutMode !== "image") {
//     out.layoutMode = "image";
//   }
//   return out;
// };

// /* ========= CRUD-like helpers ========= */
// export const listAll = () => sortBanners(BANNERS);
// export const listActive = () => sortBanners(BANNERS).filter(activeNow);
// export const getById = (id: string) => BANNERS.find((x) => x.id === id) || null;

// export const createHero = (body: PostBody): HeroBanner => {
//   const id =
//     (typeof body.id === "string" && body.id.trim()) ||
//     `banner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

//   const base: HeroBanner = {
//     id,
//     isActive: Boolean(body.isActive ?? true),
//     order: toInt(body.order ?? BANNERS.length, BANNERS.length),
//     startAt: body.startAt,
//     endAt: body.endAt,
//     layoutMode: (body.layoutMode as LayoutMode) || "image",
//     imageUrlDesktop:
//       body.imageUrlDesktop && body.imageUrlDesktop.trim()
//         ? body.imageUrlDesktop
//         : `${publicPath}/sample-desktop.jpg`,
//     imageUrlMobile: body.imageUrlMobile,
//     title: body.title,
//     subtitle: body.subtitle,
//     textAlign: body.textAlign
//       ? { x: body.textAlign.x as AlignX, y: body.textAlign.y as AlignY }
//       : undefined,
//     overlay: body.overlay
//       ? { color: body.overlay.color || "#000000", opacity: clamp01(Number(body.overlay.opacity ?? 0.4)) }
//       : undefined,
//     ctas: Array.isArray(body.ctas)
//       ? body.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant }))
//       : [],
//     linkUrl: body.linkUrl,
//     altText: body.altText,
//     locale: body.locale,
//   };

//   const created = normalize(base) as HeroBanner;
//   if (BANNERS.some((b) => b.id === created.id)) {
//     throw new Error(`duplicate id "${created.id}"`);
//   }
//   BANNERS.push(created);
//   return created;
// };

// export const updateHeroPartial = (id: string, patch: Partial<HeroBanner>) => {
//   const found = BANNERS.find((x) => x.id === id);
//   if (!found) return null;

//   const next: HeroBanner = { ...found, ...normalize(patch) } as HeroBanner;

//   if (patch.ctas) {
//     next.ctas = Array.isArray(patch.ctas)
//       ? patch.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant }))
//       : [];
//   }
//   if (patch.overlay && typeof patch.overlay.opacity === "number") {
//     next.overlay = { ...(next.overlay || {}), ...patch.overlay, opacity: clamp01(patch.overlay.opacity) };
//   }

//   const idx = BANNERS.findIndex((x) => x.id === id);
//   BANNERS[idx] = next;
//   return next;
// };

// export const removeById = (id: string) => {
//   const before = BANNERS.length;
//   BANNERS = BANNERS.filter((b) => b.id !== id);
//   return BANNERS.length !== before;
// };
