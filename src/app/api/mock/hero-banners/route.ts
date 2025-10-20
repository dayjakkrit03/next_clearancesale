// v.1.1.2 =============================================
// src/app/api/mock/hero-banners/route.ts

import { NextResponse } from "next/server";
import {
  listAll,
  listActive,
  createHero,
  updateHeroPartial,
  removeById,
  publicPath,
  type HeroBanner,
  type PostBody,
} from "./_store";

export const dynamic = "force-dynamic";

/* ===== helpers เฉพาะไฟล์นี้ ===== */
const toBool = (v: string | null | undefined) =>
  v == null ? undefined : /^(1|true|yes)$/i.test(String(v));

/** GET
 *  - ทั้งหมด:       GET /api/mock/hero-banners
 *  - เฉพาะ active: GET /api/mock/hero-banners?active=1
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const active = toBool(searchParams.get("active"));

  const items = active ? listActive() : listAll();
  return NextResponse.json(
    { items },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

/** POST: สร้างใหม่ */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as PostBody;

  if (!body.imageUrlDesktop || !body.imageUrlDesktop.startsWith(`${publicPath}/`)) {
    return NextResponse.json(
      { message: `imageUrlDesktop is required and must be under "${publicPath}/..."` },
      { status: 400 }
    );
  }

  try {
    const created = createHero(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (String(err?.message || "").startsWith("duplicate id")) {
      return NextResponse.json({ message: err.message }, { status: 409 });
    }
    return NextResponse.json({ message: "create failed" }, { status: 500 });
  }
}

/** PATCH: แก้ไขบางฟิลด์ (ยังรองรับแบบเดิมผ่าน ?id=) */
export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "missing ?id" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Partial<HeroBanner>;
  const next = updateHeroPartial(id, body);
  if (!next) return NextResponse.json({ message: `banner not found for id="${id}"` }, { status: 404 });

  return NextResponse.json(next, { status: 200 });
}

/** DELETE: ลบรายการ (ยังรองรับแบบเดิมผ่าน ?id=) */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "missing ?id" }, { status: 400 });

  const ok = removeById(id);
  if (!ok) return NextResponse.json({ message: `banner not found for id="${id}"` }, { status: 404 });

  return NextResponse.json({ ok: true }, { status: 200 });
}

// v.1.1.2 =============================================

// // src/app/api/mock/hero-banners/route.ts

// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// /* ========= Types ========= */
// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";
// type CTA = { label: string; href: string; variant?: "primary" | "outline" | "ghost" };

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

// type PostBody = Partial<HeroBanner> & { id?: string; imageUrlDesktop?: string };

// /* ========= In-memory store ========= */
// // Seed ตัวอย่าง (แก้ชื่อไฟล์ให้ตรง assets ของคุณ)
// let BANNERS: HeroBanner[] = [
//   {
//     id: "clearance-2024-week1",
//     isActive: true,
//     order: 0,
//     startAt: undefined,
//     endAt: undefined,
//     layoutMode: "image",
//     imageUrlDesktop: "/uploads/banners/clearance-2024-desktop.jpg",
//     imageUrlMobile: "/uploads/banners/clearance-2024-mobile.jpg",
//     linkUrl: "/clearance",
//     altText: "Clearance 2024 up to 90% off",
//   },
// ];

// /* ========= Helpers ========= */
// const now = () => Date.now();
// const toBool = (v: string | null | undefined) =>
//   v == null ? undefined : /^(1|true|yes)$/i.test(String(v));

// const toInt = (v: unknown, def: number) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? Math.floor(n) : def;
// };

// const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// const isWithin = (start?: string, end?: string) => {
//   const t = now();
//   const sOk = !start || (Date.parse(start) <= t);
//   const eOk = !end || (t < Date.parse(end));
//   return sOk && eOk;
// };

// const activeNow = (b: HeroBanner) => (b.isActive ?? false) && isWithin(b.startAt, b.endAt);

// const sortBanners = (list: HeroBanner[]) =>
//   [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// const normalize = (p: Partial<HeroBanner>): Partial<HeroBanner> => {
//   const out: Partial<HeroBanner> = { ...p };

//   if (typeof out.order === "number") out.order = Math.max(0, Math.floor(out.order));
//   if (out.textAlign) {
//     out.textAlign = {
//       x: (["left", "center", "right"] as AlignX[]).includes(out.textAlign.x as any)
//         ? (out.textAlign.x as AlignX)
//         : "left",
//       y: (["top", "center", "bottom"] as AlignY[]).includes(out.textAlign.y as any)
//         ? (out.textAlign.y as AlignY)
//         : "center",
//     };
//   }
//   if (out.overlay) {
//     out.overlay = {
//       color: typeof out.overlay.color === "string" && out.overlay.color ? out.overlay.color : "#000000",
//       opacity:
//         typeof out.overlay.opacity === "number" ? clamp01(out.overlay.opacity) : 0.4,
//     };
//   }
//   if (out.layoutMode !== "overlay" && out.layoutMode !== "split" && out.layoutMode !== "image") {
//     out.layoutMode = "image";
//   }
//   return out;
// };

// const coerceCreate = (body: PostBody): HeroBanner => {
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
//         : "/uploads/banners/sample-desktop.jpg",
//     imageUrlMobile: body.imageUrlMobile,
//     title: body.title,
//     subtitle: body.subtitle,
//     textAlign: body.textAlign
//       ? { x: body.textAlign.x as AlignX, y: body.textAlign.y as AlignY }
//       : undefined,
//     overlay: body.overlay
//       ? { color: body.overlay.color || "#000000", opacity: clamp01(Number(body.overlay.opacity ?? 0.4)) }
//       : undefined,
//     ctas: Array.isArray(body.ctas) ? body.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant })) : [],
//     linkUrl: body.linkUrl,
//     altText: body.altText,
//     locale: body.locale,
//   };

//   return normalize(base) as HeroBanner;
// };

// const upsert = (b: HeroBanner) => {
//   const idx = BANNERS.findIndex((x) => x.id === b.id);
//   if (idx >= 0) BANNERS[idx] = { ...b };
//   else BANNERS.push({ ...b });
// };

// const updatePartial = (id: string, patch: Partial<HeroBanner>) => {
//   const found = BANNERS.find((x) => x.id === id);
//   if (!found) return null;
//   const next: HeroBanner = { ...found, ...normalize(patch) } as HeroBanner;
//   // ปรับ ctas ให้ปลอดภัย
//   if (patch.ctas) {
//     next.ctas = Array.isArray(patch.ctas)
//       ? patch.ctas.map((c) => ({ label: c.label, href: c.href, variant: c.variant }))
//       : [];
//   }
//   // ปรับ overlay opacity ให้อยู่ในช่วง 0..1
//   if (patch.overlay && typeof patch.overlay.opacity === "number") {
//     next.overlay = { ...(next.overlay || {}), ...patch.overlay, opacity: clamp01(patch.overlay.opacity) };
//   }
//   upsert(next);
//   return next;
// };

// /* ========= Handlers ========= */
// /** GET
//  *  - ทั้งหมด:       GET /api/mock/hero-banners
//  *  - เฉพาะ active: GET /api/mock/hero-banners?active=1
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const active = toBool(searchParams.get("active"));

//   const list = sortBanners(BANNERS);
//   const items = active ? list.filter(activeNow) : list;

//   return NextResponse.json({ items }, { status: 200, headers: { "Cache-Control": "no-store" } });
// }

// /** POST: สร้างใหม่ */
// export async function POST(req: Request) {
//   const body = (await req.json().catch(() => ({}))) as PostBody;

//   if (!body.imageUrlDesktop || !body.imageUrlDesktop.startsWith("/uploads/banners/")) {
//     return NextResponse.json(
//       { message: `imageUrlDesktop is required and must be under "/uploads/banners/..."` },
//       { status: 400 }
//     );
//   }

//   const created = coerceCreate(body);
//   if (BANNERS.some((b) => b.id === created.id)) {
//     return NextResponse.json({ message: `banner already exists for id="${created.id}"` }, { status: 409 });
//   }
//   upsert(created);
//   return NextResponse.json(created, { status: 201 });
// }

// /** PATCH: แก้ไขแบนเนอร์ (partial) */
// export async function PATCH(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   if (!id) return NextResponse.json({ message: "missing ?id" }, { status: 400 });

//   const body = (await req.json().catch(() => ({}))) as Partial<HeroBanner>;
//   const next = updatePartial(id, body);
//   if (!next) return NextResponse.json({ message: `banner not found for id="${id}"` }, { status: 404 });

//   return NextResponse.json(next, { status: 200 });
// }

// /** DELETE: ลบแบนเนอร์ */
// export async function DELETE(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   if (!id) return NextResponse.json({ message: "missing ?id" }, { status: 400 });

//   const before = BANNERS.length;
//   BANNERS = BANNERS.filter((b) => b.id !== id);
//   if (BANNERS.length === before) {
//     return NextResponse.json({ message: `banner not found for id="${id}"` }, { status: 404 });
//   }
//   return NextResponse.json({ ok: true }, { status: 200 });
// }
