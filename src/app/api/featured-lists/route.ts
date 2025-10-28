// v.1.1.2 ================================================
// src/app/api/featured-lists/route.ts

import { NextResponse } from "next/server";
import {
  loadFeaturedLists,
  loadFeaturedListByKey,
  createFeaturedList,
  saveFeaturedList,
  deleteFeaturedList,
} from "@/services/featured-list-service";

/* ================== GET /api/featured-lists ================== */
/**
 * ดึงรายการ featured lists ทั้งหมด (lite) หรือดึงรายละเอียดรายการเดียว (full)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const all = searchParams.get("all");

    if (key) {
      const includeItems = all === "1";
      const list = await loadFeaturedListByKey(key, includeItems);

      if (!list) {
        return NextResponse.json(
          { error: `Featured list with key "${key}" not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json(list);
    } else {
      const lists = await loadFeaturedLists();
      return NextResponse.json({ items: lists });
    }
  } catch (error) {
    console.error("GET /api/featured-lists failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured lists." },
      { status: 500 }
    );
  }
}

/* ================== POST /api/featured-lists ================== */
/**
 * สร้าง Featured List ใหม่
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // รับ key, title, subtitle, limit, และ items จาก body
    const { key, title, subtitle, limit } = body;

    if (!key || !title) {
      return NextResponse.json(
        { error: "Missing required fields: key and title." },
        { status: 400 }
      );
    }

    // ตรวจสอบ key ซ้ำ
    const existing = await loadFeaturedListByKey(key, false);
    if (existing) {
      return NextResponse.json(
        { error: `Key "${key}" already exists.` },
        { status: 409 }
      );
    }

    // 💡 แก้ไข: ลบ items: [] ออกจาก object literal เพื่อให้ตรงกับ Type Omit<FeaturedList, "items">
    const newList = await createFeaturedList({
      key,
      title,
      subtitle,
      limit: limit !== undefined ? Number(limit) : undefined,
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/featured-lists failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create featured list." },
      { status: 500 }
    );
  }
}

/* ================== PATCH /api/featured-lists?key=... ================== */
/**
 * อัปเดต Featured List
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const body = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Missing required parameter: key." },
        { status: 400 }
      );
    }

    const updatedList = await saveFeaturedList(key, body);

    if (!updatedList) {
      return NextResponse.json(
        { error: `Featured list with key "${key}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedList);
  } catch (error: any) {
    console.error("PATCH /api/featured-lists failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update featured list." },
      { status: 500 }
    );
  }
}

/* ================== DELETE /api/featured-lists?key=... ================== */
/**
 * ลบ Featured List
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing required parameter: key." },
        { status: 400 }
      );
    }

    await deleteFeaturedList(key);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE /api/featured-lists failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete featured list." },
      { status: 500 }
    );
  }
}
// v.1.1.2 ================================================

// // src/app/api/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   createFeaturedList,
//   updateFeaturedList,
// } from "@/services/featured-list-service"; // <-- เปลี่ยนมาใช้ Service
// import { FeaturedList } from "@/mocks/featured-lists";

// export const dynamic = "force-dynamic";

// /** number helper */
// const toInt = (v: string | null, def: number) => {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
// };

// /**
//  * GET
//  * - รวมทั้งหมด:  GET /api/featured-lists
//  * - ลิสต์เดียว:
//  *     - (เต็มก้อน)   GET /api/featured-lists?key=home_weekly&all=1
//  *     - (แบ่งหน้า)   GET /api/featured-lists?key=home_weekly&page=1&pageSize=6
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");

//   // ไม่มี key => ส่งรายการลิสต์ทั้งหมด
//   if (!key) {
//     try {
//       const lists = await getAllFeaturedLists();
//       return NextResponse.json(
//         { items: lists },
//         { status: 200, headers: { "Cache-Control": "no-store" } }
//       );
//     } catch (error) {
//       console.error("API GET /featured-lists error:", error);
//       return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//     }
//   }

//   // มี key => อ่านลิสต์เดียว
//   const list = await getFeaturedListByKey(key);
//   if (!list) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   // ✅ โหมดดึงก้อนเต็ม (ใช้ฝั่งแอดมิน)
//   const allFlag = (searchParams.get("all") ?? "").toLowerCase();
//   const wantAll = ["1", "true", "yes"].includes(allFlag);
//   if (wantAll) {
//     // ใน DB Items ถูกดึงมาและเรียงแล้วใน getFeaturedListByKey
//     const payload: FeaturedList = list;
//     return NextResponse.json(payload, {
//       status: 200,
//       headers: { "Cache-Control": "no-store" },
//     });
//   }

//   // โหมดแบ่งหน้า (หน้า Frontend ใช้โหลดเพิ่ม)
//   const legacyLimit = searchParams.get("limit");
//   const pageSizeParam = searchParams.get("pageSize");
//   const pageParam = searchParams.get("page");

//   const defaultPageSize =
//     typeof list.limit === "number" && list.limit > 0 ? list.limit : 24;
//   const pageSize = toInt(pageSizeParam ?? legacyLimit, defaultPageSize);
//   const page = toInt(pageParam, 1);

//   const sorted = list.items; // ถูกเรียงตาม order มาจาก service แล้ว
//   const total = sorted.length;
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize;

//   const safeStart = Math.max(0, Math.min(start, total));
//   const safeEnd = Math.max(safeStart, Math.min(end, total));
//   const slice = sorted.slice(safeStart, safeEnd);
//   const hasMore = safeEnd < total;

//   const meta = {
//     key: list.key,
//     title: list.title,
//     subtitle: list.subtitle,
//     limit: list.limit,
//   };

//   return NextResponse.json(
//     {
//       items: slice, // { productId, order } เฉพาะหน้าปัจจุบัน
//       total,
//       page,
//       pageSize,
//       hasMore,
//       meta,
//     },
//     { status: 200, headers: { "Cache-Control": "no-store" } }
//   );
// }

// /** PATCH: แก้ไขลิสต์ (ชื่อ/คำอธิบาย/limit/รายการสินค้า) */
// export async function PATCH(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   if (!key) {
//     return NextResponse.json({ message: "missing ?key" }, { status: 400 });
//   }

//   // ตรวจสอบว่ามีลิสต์อยู่จริงไหม
//   const existing = await getFeaturedListByKey(key);
//   if (!existing) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   const body = await req.json().catch(() => ({}));
//   const data: Partial<Omit<FeaturedList, "key">> = {
//     title: body.title,
//     subtitle: body.subtitle,
//     limit:
//       typeof body.limit === "number" && body.limit > 0
//         ? body.limit
//         : body.limit === null || body.limit === undefined ? undefined : existing.limit, // อนุญาตให้ set เป็น undefined ได้
//     // ส่ง items เข้าไปตรงๆ ให้ service จัดการ normalize/upsert เอง
//     items: Array.isArray(body.items) ? body.items : undefined,
//   };

//   try {
//     const updated = await updateFeaturedList(key, data);
//     return NextResponse.json(updated, { status: 200 });
//   } catch (error) {
//     console.error("API PATCH /featured-lists error:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }

// /** POST: สร้างลิสต์ใหม่ */
// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));

//   const key = String(body.key || "").trim();
//   if (!key) {
//     return NextResponse.json({ message: "key is required" }, { status: 400 });
//   }

//   // ตรวจสอบ key ซ้ำก่อนสร้าง
//   if (await getFeaturedListByKey(key)) {
//     return NextResponse.json(
//       { message: `featured list already exists for key="${key}"` },
//       { status: 409 }
//     );
//   }

//   const title =
//     typeof body.title === "string" && body.title.trim()
//       ? body.title.trim()
//       : key;
//   const subtitle = typeof body.subtitle === "string" ? body.subtitle : undefined;
//   const limit =
//     typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;

//   const items = Array.isArray(body.items) ? body.items : [];

//   const newFeaturedList: FeaturedList = {
//     key,
//     title,
//     subtitle,
//     limit,
//     items,
//   };

//   try {
//     const created = await createFeaturedList(newFeaturedList);
//     return NextResponse.json(created, { status: 201 });
//   } catch (error) {
//     console.error("API POST /featured-lists error:", error);
//     // หากเกิด Error จากการสร้าง (เช่น unique constraint violation)
//     if (error instanceof Error && error.message.includes('featured list already exists')) {
//       return NextResponse.json(
//         { message: `featured list already exists for key="${key}"` },
//         { status: 409 }
//       );
//     }
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }