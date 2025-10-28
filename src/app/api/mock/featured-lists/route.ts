// v.1.1.8 ================================================
// src/app/api/mock/featured-lists/route.ts

import { NextResponse } from "next/server";
import {
  loadFeaturedLists,
  loadFeaturedListByKey,
  createFeaturedList, // ใช้สำหรับ POST
  saveFeaturedList,
  deleteFeaturedList, 
} from "@/services/featured-list-service";

/* ================== GET /api/mock/featured-lists ================== */
/**
 * ดึงรายการ featured lists ทั้งหมด (lite) หรือดึงรายละเอียดรายการเดียว (full)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    // ในโค้ด frontend ของเราใช้ parameters: page, pageSize, และ key เป็นหลัก
    // ส่วน 'all' ในโค้ดนี้ดูเหมือนจะถูกแทนที่ด้วยการเรียกแบบ paged ใน frontend
    
    // ตรวจสอบว่ามีการส่ง key มาหรือไม่
    if (key) {
      // 💡 โหลดแบบเต็ม (Full details) เมื่อมีการระบุ key
      // โค้ด frontend ของเราเรียกแบบมี page/pageSize แต่ service อาจจะละเลยได้
      const includeItems = true; // สมมติว่าต้องการ items เมื่อระบุ key
      const list = await loadFeaturedListByKey(key, includeItems);

      if (!list) {
        return NextResponse.json(
          { error: `Featured list with key "${key}" not found.` },
          { status: 404 }
        );
      }

      // เนื่องจากโค้ด frontend คาดหวัง FeaturedListPagedResponse (ที่มี items[], total, meta) 
      // เราอาจต้องแปลงผลลัพธ์จาก loadFeaturedListByKey (ซึ่งเป็น FeaturedList) ให้อยู่ในรูปแบบ Paged
      // (ตามที่เคยเห็นใน featured-list-editor.tsx: const raw = await res.json();)
      return NextResponse.json({
        items: list.items, // รายการสินค้า
        total: list.items.length, // จำนวนรายการทั้งหมด
        page: 1,
        pageSize: list.limit || list.items.length,
        hasMore: false,
        meta: {
          key: list.key,
          title: list.title,
          subtitle: list.subtitle,
          limit: list.limit
        }
      });
    } else {
      // 💡 โหลดลิสต์ทั้งหมด (Lite) เมื่อไม่มี key
      const lists = await loadFeaturedLists();
      return NextResponse.json({ items: lists });
    }
  } catch (error) {
    console.error("GET /api/mock/featured-lists failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured lists." },
      { status: 500 }
    );
  }
}

// 🚀 แก้ไขฟังก์ชัน POST เพื่อบังคับให้ title เป็น string เสมอ
/* ================== POST /api/mock/featured-lists ================== */
/**
 * สร้าง featured list ใหม่ (Mock API)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        // รับเฉพาะ field ที่จำเป็นสำหรับการสร้างลิสต์ใหม่
        const { key, title, subtitle, limit } = body; 
        
        // 1. ตรวจสอบ key (ต้องมีค่าและเป็น string)
        if (!key || typeof key !== 'string' || key.trim() === '') {
            return NextResponse.json(
                { error: "Missing required field: key." },
                { status: 400 } // Bad Request
            );
        }

        // 2. ตรวจสอบ key ซ้ำก่อนสร้าง
        const existing = await loadFeaturedListByKey(key, false);
        if (existing) {
             return NextResponse.json(
                { error: `Key "${key}" already exists.` },
                { status: 409 } // Conflict
            );
        }

        // 3. 🛑 แก้ไข Type Mismatch: กำหนดค่า title ที่ใช้สำหรับ Service
        //    ถ้า title เป็น string และมีค่า ให้ใช้ title นั้น
        //    ถ้า title เป็น undefined/null/string ว่าง ให้ใช้ key แทน (เพื่อให้เป็น string เสมอ)
        const finalTitle = (typeof title === 'string' && title.trim() !== '') 
                            ? title.trim() 
                            : key; 
                            
        // 4. เรียกใช้ service เพื่อสร้างลิสต์
        const newList = await createFeaturedList({
            key,
            title: finalTitle, // ส่งค่าที่เป็น string เสมอ
            subtitle,
            // แปลง limit เป็นตัวเลขถ้ามีค่า ไม่งั้นจะเป็น undefined
            limit: typeof limit === "number" ? limit : undefined,
        });

        // ส่ง Response กลับไปพร้อมสถานะ 201 Created และข้อมูลลิสต์ใหม่
        return NextResponse.json(newList, { status: 201 });

    } catch (error: any) {
        console.error("POST /api/mock/featured-lists failed:", error);
        // หากเกิด error อื่นๆ (เช่น จาก service ภายใน)
        return NextResponse.json(
            { error: error.message || "Failed to create featured list." },
            { status: 500 }
        );
    }
}


/* ================== PATCH /api/mock/featured-lists ================== */
/**
 * อัปเดต featured list
 */
export async function PATCH(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const key = searchParams.get("key");

      if (!key) {
        return NextResponse.json(
          { error: "Missing 'key' parameter for update." },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { title, subtitle, limit, items } = body;

      const updatedList = await saveFeaturedList(key, { title, subtitle, limit, items });

      return NextResponse.json(updatedList);
    } catch (error) {
      console.error("PATCH /api/mock/featured-lists failed:", error);
      return NextResponse.json(
        { error: "Failed to save featured list." },
        { status: 500 }
      );
    }
}

// v.1.1.8 ================================================

// v.1.1.7 ================================================
// // src/app/api/mock/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   loadFeaturedLists,
//   loadFeaturedListByKey,
//   createFeaturedList, // ใช้สำหรับ POST
//   saveFeaturedList,
//   deleteFeaturedList, 
// } from "@/services/featured-list-service";

// /* ================== GET /api/mock/featured-lists ================== */
// /**
//  * ดึงรายการ featured lists ทั้งหมด (lite) หรือดึงรายละเอียดรายการเดียว (full)
//  */
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const key = searchParams.get("key");
//     // ในโค้ด frontend ของเราใช้ parameters: page, pageSize, และ key เป็นหลัก
//     // ส่วน 'all' ในโค้ดนี้ดูเหมือนจะถูกแทนที่ด้วยการเรียกแบบ paged ใน frontend
    
//     // ตรวจสอบว่ามีการส่ง key มาหรือไม่
//     if (key) {
//       // 💡 โหลดแบบเต็ม (Full details) เมื่อมีการระบุ key
//       // โค้ด frontend ของเราเรียกแบบมี page/pageSize แต่ service อาจจะละเลยได้
//       const includeItems = true; // สมมติว่าต้องการ items เมื่อระบุ key
//       const list = await loadFeaturedListByKey(key, includeItems);

//       if (!list) {
//         return NextResponse.json(
//           { error: `Featured list with key "${key}" not found.` },
//           { status: 404 }
//         );
//       }

//       // เนื่องจากโค้ด frontend คาดหวัง FeaturedListPagedResponse (ที่มี items[], total, meta) 
//       // เราอาจต้องแปลงผลลัพธ์จาก loadFeaturedListByKey (ซึ่งเป็น FeaturedList) ให้อยู่ในรูปแบบ Paged
//       // (ตามที่เคยเห็นใน featured-list-editor.tsx: const raw = await res.json();)
//       return NextResponse.json({
//         items: list.items, // รายการสินค้า
//         total: list.items.length, // จำนวนรายการทั้งหมด
//         page: 1,
//         pageSize: list.limit || list.items.length,
//         hasMore: false,
//         meta: {
//           key: list.key,
//           title: list.title,
//           subtitle: list.subtitle,
//           limit: list.limit
//         }
//       });
//     } else {
//       // 💡 โหลดลิสต์ทั้งหมด (Lite) เมื่อไม่มี key
//       const lists = await loadFeaturedLists();
//       return NextResponse.json({ items: lists });
//     }
//   } catch (error) {
//     console.error("GET /api/mock/featured-lists failed:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch featured lists." },
//       { status: 500 }
//     );
//   }
// }

// // 🚀 เพิ่มฟังก์ชัน POST เพื่อรองรับการสร้างลิสต์ใหม่
// /* ================== POST /api/mock/featured-lists ================== */
// /**
//  * สร้าง featured list ใหม่ (Mock API)
//  */
// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//         // รับเฉพาะ field ที่จำเป็นสำหรับการสร้างลิสต์ใหม่ (ไม่รวม items เพราะ service ควรจัดการเอง)
//         const { key, title, subtitle, limit } = body; 

//         // ตรวจสอบข้อมูลขั้นต่ำที่จำเป็น
//         if (!key || typeof title !== 'string') {
//             return NextResponse.json(
//                 { error: "Missing required fields: key, title." },
//                 { status: 400 } // Bad Request
//             );
//         }

//         // ตรวจสอบ key ซ้ำก่อนสร้าง (Mock Service อาจจะจัดการให้แล้ว แต่เพิ่มไว้เพื่อความมั่นใจ)
//         const existing = await loadFeaturedListByKey(key, false);
//         if (existing) {
//              return NextResponse.json(
//                 { error: `Key "${key}" already exists.` },
//                 { status: 409 } // Conflict
//             );
//         }

//         // เรียกใช้ service เพื่อสร้างลิสต์
//         const newList = await createFeaturedList({
//             key,
//             title,
//             subtitle,
//             // แปลง limit เป็นตัวเลขถ้ามีค่า ไม่งั้นจะเป็น undefined
//             limit: typeof limit === "number" ? limit : undefined,
//         });

//         // ส่ง Response กลับไปพร้อมสถานะ 201 Created และข้อมูลลิสต์ใหม่
//         return NextResponse.json(newList, { status: 201 });

//     } catch (error: any) {
//         console.error("POST /api/mock/featured-lists failed:", error);
//         // หากเกิด error อื่นๆ (เช่น จาก service ภายใน)
//         return NextResponse.json(
//             { error: error.message || "Failed to create featured list." },
//             { status: 500 }
//         );
//     }
// }

// /* ================== PATCH /api/mock/featured-lists ================== */
// /**
//  * อัปเดต featured list
//  */
// export async function PATCH(request: Request) {
//     try {
//       const { searchParams } = new URL(request.url);
//       const key = searchParams.get("key");

//       if (!key) {
//         return NextResponse.json(
//           { error: "Missing 'key' parameter for update." },
//           { status: 400 }
//         );
//       }

//       const body = await request.json();
//       const { title, subtitle, limit, items } = body;

//       const updatedList = await saveFeaturedList(key, { title, subtitle, limit, items });

//       return NextResponse.json(updatedList);
//     } catch (error) {
//       console.error("PATCH /api/mock/featured-lists failed:", error);
//       return NextResponse.json(
//         { error: "Failed to save featured list." },
//         { status: 500 }
//       );
//     }
// }
// v.1.1.7 ================================================

// v.1.1.6 ================================================ db version
// // src/app/api/mock/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   loadFeaturedLists,
//   loadFeaturedListByKey,
//   createFeaturedList, // อาจไม่ได้ใช้ตรงนี้ แต่ก็ใส่ไว้
//   saveFeaturedList,
//   deleteFeaturedList, // อาจไม่ได้ใช้ตรงนี้ แต่ก็ใส่ไว้
// } from "@/services/featured-list-service";

// /* ================== GET /api/mock/featured-lists ================== */
// /**
//  * ดึงรายการ featured lists ทั้งหมด (lite) หรือดึงรายละเอียดรายการเดียว (full)
//  */
// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const key = searchParams.get("key");
//     // ในโค้ด frontend ของเราใช้ parameters: page, pageSize, และ key เป็นหลัก
//     // ส่วน 'all' ในโค้ดนี้ดูเหมือนจะถูกแทนที่ด้วยการเรียกแบบ paged ใน frontend
    
//     // ตรวจสอบว่ามีการส่ง key มาหรือไม่
//     if (key) {
//       // 💡 โหลดแบบเต็ม (Full details) เมื่อมีการระบุ key
//       // โค้ด frontend ของเราเรียกแบบมี page/pageSize แต่ service อาจจะละเลยได้
//       const includeItems = true; // สมมติว่าต้องการ items เมื่อระบุ key
//       const list = await loadFeaturedListByKey(key, includeItems);

//       if (!list) {
//         return NextResponse.json(
//           { error: `Featured list with key "${key}" not found.` },
//           { status: 404 }
//         );
//       }

//       // เนื่องจากโค้ด frontend คาดหวัง FeaturedListPagedResponse (ที่มี items[], total, meta) 
//       // เราอาจต้องแปลงผลลัพธ์จาก loadFeaturedListByKey (ซึ่งเป็น FeaturedList) ให้อยู่ในรูปแบบ Paged
//       // (ตามที่เคยเห็นใน featured-list-editor.tsx: const raw = await res.json();)
//       return NextResponse.json({
//         items: list.items, // รายการสินค้า
//         total: list.items.length, // จำนวนรายการทั้งหมด
//         page: 1,
//         pageSize: list.limit || list.items.length,
//         hasMore: false,
//         meta: {
//           key: list.key,
//           title: list.title,
//           subtitle: list.subtitle,
//           limit: list.limit
//         }
//       });
//     } else {
//       // 💡 โหลดลิสต์ทั้งหมด (Lite) เมื่อไม่มี key
//       const lists = await loadFeaturedLists();
//       return NextResponse.json({ items: lists });
//     }
//   } catch (error) {
//     console.error("GET /api/mock/featured-lists failed:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch featured lists." },
//       { status: 500 }
//     );
//   }
// }

// /* ================== PATCH /api/mock/featured-lists ================== */
// /**
//  * อัปเดต featured list
//  */
// export async function PATCH(request: Request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const key = searchParams.get("key");

//         if (!key) {
//             return NextResponse.json(
//                 { error: "Missing 'key' parameter for update." },
//                 { status: 400 }
//             );
//         }

//         const body = await request.json();
//         const { title, subtitle, limit, items } = body;

//         const updatedList = await saveFeaturedList(key, { title, subtitle, limit, items });

//         return NextResponse.json(updatedList);
//     } catch (error) {
//         console.error("PATCH /api/mock/featured-lists failed:", error);
//         return NextResponse.json(
//             { error: "Failed to save featured list." },
//             { status: 500 }
//         );
//     }
// }
// v.1.1.6 ================================================

// v.1.1.5 ================================================ mock api
// // src/app/api/mock/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   upsertFeaturedList,
//   createFeaturedList,
//   type FeaturedList,
// } from "@/mocks/featured-lists";

// export const dynamic = "force-dynamic";

// /** number helper */
// const toInt = (v: string | null, def: number) => {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
// };

// /**
//  * GET
//  * - รวมทั้งหมด:  GET /api/mock/featured-lists
//  * - ลิสต์เดียว:
//  *     - (เต็มก้อน)   GET /api/mock/featured-lists?key=home_weekly&all=1
//  *     - (แบ่งหน้า)   GET /api/mock/featured-lists?key=home_weekly&page=1&pageSize=6
//  *   พารามิเตอร์:
//  *     - key: string (จำเป็นเมื่ออ่านลิสต์เดียว)
//  *     - all: "1"|"true"|"yes" → ส่งก้อนเต็ม (title/subtitle/limit/items ทั้งหมด)
//  *     - page: number (>=1), pageSize: number (>=1) → โหมดแบ่งหน้า
//  *     - (legacy) limit: number → ใช้เป็น pageSize หากส่งมา
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");

//   // ไม่มี key => ส่งรายการลิสต์ทั้งหมด
//   if (!key) {
//     const lists = getAllFeaturedLists().map((l: FeaturedList) => ({
//       ...l,
//       items: [...l.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//     }));
//     return NextResponse.json(
//       { items: lists },
//       { status: 200, headers: { "Cache-Control": "no-store" } },
//     );
//   }

//   // มี key => อ่านลิสต์เดียว
//   const list = getFeaturedListByKey(key);
//   if (!list) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 },
//     );
//   }

//   // ✅ โหมดดึงก้อนเต็ม (ใช้ฝั่งแอดมิน)
//   const allFlag = (searchParams.get("all") ?? "").toLowerCase();
//   const wantAll = ["1", "true", "yes"].includes(allFlag);
//   if (wantAll) {
//     const payload: FeaturedList = {
//       ...list,
//       items: [...list.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//     };
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

//   const sorted = [...list.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
//     { status: 200, headers: { "Cache-Control": "no-store" } },
//   );
// }

// /** PATCH: แก้ไขลิสต์ (ชื่อ/คำอธิบาย/limit/รายการสินค้า) */
// export async function PATCH(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   if (!key) {
//     return NextResponse.json({ message: "missing ?key" }, { status: 400 });
//   }

//   const existing = getFeaturedListByKey(key);
//   if (!existing) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 },
//     );
//   }

//   const body = await req.json().catch(() => ({}));
//   const next: FeaturedList = {
//     ...existing,
//     title: body.title ?? existing.title,
//     subtitle: body.subtitle ?? existing.subtitle,
//     limit:
//       typeof body.limit === "number" && body.limit > 0
//         ? body.limit
//         : existing.limit,
//     items: Array.isArray(body.items)
//       ? body.items.map((it: any, i: number) => ({
//           productId: it.productId ?? it.id,
//           order:
//             typeof it.order === "number"
//               ? it.order
//               : typeof it.index === "number"
//               ? it.index + 1
//               : i + 1,
//         }))
//       : existing.items,
//   };

//   upsertFeaturedList(next);
//   return NextResponse.json(next, { status: 200 });
// }

// /** POST: สร้างลิสต์ใหม่ */
// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));

//   const key = String(body.key || "").trim();
//   if (!key) {
//     return NextResponse.json({ message: "key is required" }, { status: 400 });
//   }

//   if (getFeaturedListByKey(key)) {
//     return NextResponse.json(
//       { message: `featured list already exists for key="${key}"` },
//       { status: 409 },
//     );
//   }

//   const title =
//     typeof body.title === "string" && body.title.trim()
//       ? body.title.trim()
//       : key;
//   const subtitle = typeof body.subtitle === "string" ? body.subtitle : undefined;
//   const limit =
//     typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;

//   const items = Array.isArray(body.items)
//     ? body.items.map((it: any, i: number) => ({
//         productId: it.productId ?? it.id,
//         order:
//           typeof it.order === "number"
//             ? it.order
//             : typeof it.index === "number"
//             ? it.index + 1
//             : i + 1,
//       }))
//     : [];

//   const created: FeaturedList = {
//     key,
//     title,
//     subtitle,
//     limit,
//     items,
//   };

//   createFeaturedList(created);
//   return NextResponse.json(created, { status: 201 });
// }

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/app/api/mock/featured-lists/route.ts
// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   upsertFeaturedList,
//   createFeaturedList,
//   type FeaturedList,
// } from "@/mocks/featured-lists";

// export const dynamic = "force-dynamic";

// /** number helper */
// const toInt = (v: string | null, def: number) => {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
// };

// /**
//  * GET
//  * - แบบรวมทั้งหมด       : GET /api/mock/featured-lists
//  * - แบบอ่านลิสต์เดียว   : GET /api/mock/featured-lists?key=home_weekly&page=1&pageSize=6
//  *   พารามิเตอร์:
//  *     - key: string (จำเป็นเมื่ออ่านลิสต์เดียว)
//  *     - page: number (>=1)          เริ่มต้น = 1
//  *     - pageSize: number (>=1)      เริ่มต้น = limit ของลิสต์ หรือ 24 หากไม่มี
//  *     - (legacy) limit: number      ยังรองรับ โดยจะถูกใช้เป็นค่า pageSize ถ้าส่งมา
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");

//   // ไม่มี key => ส่งรายการลิสต์ทั้งหมด (เหมือนเดิม)
//   if (!key) {
//     const lists = getAllFeaturedLists().map((l: FeaturedList) => ({
//       ...l,
//       items: [...l.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//     }));
//     return NextResponse.json({ items: lists }, { status: 200 });
//   }

//   // มี key => อ่านลิสต์เดียว (รองรับแบ่งหน้า)
//   const list = getFeaturedListByKey(key);
//   if (!list) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   // รองรับทั้ง pageSize และ (legacy) limit
//   const legacyLimit = searchParams.get("limit");
//   const pageSizeParam = searchParams.get("pageSize");
//   const pageParam = searchParams.get("page");

//   const defaultPageSize = typeof list.limit === "number" && list.limit > 0 ? list.limit : 24;
//   const pageSize = toInt(pageSizeParam ?? legacyLimit, defaultPageSize);
//   const page = toInt(pageParam, 1);

//   const sorted = [...list.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//   const total = sorted.length;
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize;

//   // guard ช่วง index
//   const safeStart = Math.max(0, Math.min(start, total));
//   const safeEnd = Math.max(safeStart, Math.min(end, total));
//   const slice = sorted.slice(safeStart, safeEnd);

//   const hasMore = safeEnd < total;

//   // meta สำหรับส่วนหัว/ตั้งค่าอื่น ๆ
//   const meta = {
//     key: list.key,
//     title: list.title,
//     subtitle: list.subtitle,
//     limit: list.limit, // ค่าเดิมที่ตั้งไว้ในลิสต์ (อาจต่างจาก pageSize ที่ client ขอ)
//   };

//   return NextResponse.json(
//     {
//       items: slice,   // รายการเฉพาะหน้าปัจจุบัน (เป็น { productId, order })
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

//   const existing = getFeaturedListByKey(key);
//   if (!existing) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   const body = await req.json().catch(() => ({}));
//   const next: FeaturedList = {
//     ...existing,
//     title: body.title ?? existing.title,
//     subtitle: body.subtitle ?? existing.subtitle,
//     limit: typeof body.limit === "number" && body.limit > 0 ? body.limit : existing.limit,
//     items: Array.isArray(body.items)
//       ? body.items.map((it: any, i: number) => ({
//           productId: it.productId ?? it.id,
//           order:
//             typeof it.order === "number"
//               ? it.order
//               : typeof it.index === "number"
//               ? it.index + 1
//               : i + 1,
//         }))
//       : existing.items,
//   };

//   upsertFeaturedList(next);
//   return NextResponse.json(next, { status: 200 });
// }

// /** POST: สร้างลิสต์ใหม่ */
// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));

//   const key = String(body.key || "").trim();
//   if (!key) {
//     return NextResponse.json({ message: "key is required" }, { status: 400 });
//   }

//   if (getFeaturedListByKey(key)) {
//     return NextResponse.json(
//       { message: `featured list already exists for key="${key}"` },
//       { status: 409 }
//     );
//   }

//   const title =
//     typeof body.title === "string" && body.title.trim()
//       ? body.title.trim()
//       : key;
//   const subtitle =
//     typeof body.subtitle === "string" ? body.subtitle : undefined;
//   const limit =
//     typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;

//   const items = Array.isArray(body.items)
//     ? body.items.map((it: any, i: number) => ({
//         productId: it.productId ?? it.id,
//         order:
//           typeof it.order === "number"
//             ? it.order
//             : typeof it.index === "number"
//             ? it.index + 1
//             : i + 1,
//       }))
//     : [];

//   const created: FeaturedList = {
//     key,
//     title,
//     subtitle,
//     limit,
//     items,
//   };

//   createFeaturedList(created);
//   return NextResponse.json(created, { status: 201 });
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/api/mock/featured-lists/route.ts
// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   upsertFeaturedList,     // PATCH/UPSERT
//   createFeaturedList,     // ⬅️ NEW: ใช้ตอน POST
//   type FeaturedList,
// } from "@/mocks/featured-lists";

// export const dynamic = "force-dynamic";

// /** GET: ทั้งหมด หรือ ?key=... */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   const limitStr = searchParams.get("limit");
//   const limit = limitStr ? Math.max(1, Number(limitStr)) : undefined;

//   if (key) {
//     const list = getFeaturedListByKey(key);
//     if (!list) {
//       return NextResponse.json(
//         { message: `featured list not found for key="${key}"` },
//         { status: 404 }
//       );
//     }

//     const items = [...list.items]
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .slice(0, limit ?? list.limit ?? list.items.length);

//     const payload: FeaturedList = { ...list, items };
//     return NextResponse.json(payload, { status: 200 });
//   }

//   const lists = getAllFeaturedLists().map((l: FeaturedList) => ({
//     ...l,
//     items: [...l.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//   }));
//   return NextResponse.json({ items: lists }, { status: 200 });
// }

// /** PATCH: แก้ไขลิสต์ (ชื่อ/คำอธิบาย/limit/รายการสินค้า) */
// export async function PATCH(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   if (!key) {
//     return NextResponse.json({ message: "missing ?key" }, { status: 400 });
//   }

//   const existing = getFeaturedListByKey(key);
//   if (!existing) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   const body = await req.json().catch(() => ({}));
//   const next: FeaturedList = {
//     ...existing,
//     title: body.title ?? existing.title,
//     subtitle: body.subtitle ?? existing.subtitle,
//     limit: typeof body.limit === "number" ? body.limit : existing.limit,
//     items: Array.isArray(body.items)
//       ? body.items.map((it: any, i: number) => ({
//           productId: it.productId ?? it.id, // เผื่อ client ส่ง id มา
//           order:
//             typeof it.order === "number"
//               ? it.order
//               : typeof it.index === "number"
//               ? it.index + 1
//               : i + 1,
//         }))
//       : existing.items,
//   };

//   upsertFeaturedList(next);
//   return NextResponse.json(next, { status: 200 });
// }

// /** POST: สร้างลิสต์ใหม่ */
// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));

//   const key = String(body.key || "").trim();
//   if (!key) {
//     return NextResponse.json({ message: "key is required" }, { status: 400 });
//   }

//   if (getFeaturedListByKey(key)) {
//     return NextResponse.json(
//       { message: `featured list already exists for key="${key}"` },
//       { status: 409 }
//     );
//   }

//   const title =
//     typeof body.title === "string" && body.title.trim()
//       ? body.title.trim()
//       : key;
//   const subtitle =
//     typeof body.subtitle === "string" ? body.subtitle : undefined;
//   const limit =
//     typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;

//   const items = Array.isArray(body.items)
//     ? body.items.map((it: any, i: number) => ({
//         productId: it.productId ?? it.id,
//         order:
//           typeof it.order === "number"
//             ? it.order
//             : typeof it.index === "number"
//             ? it.index + 1
//             : i + 1,
//       }))
//     : [];

//   const created: FeaturedList = {
//     key,
//     title,
//     subtitle,
//     limit,
//     items,
//   };

//   createFeaturedList(created);
//   return NextResponse.json(created, { status: 201 });
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/api/mock/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   type FeaturedList,
//   upsertFeaturedList,   // ⬅️ ใช้ตอน PATCH
// } from "@/mocks/featured-lists";

// export const dynamic = "force-dynamic";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   const limitStr = searchParams.get("limit");
//   const limit = limitStr ? Math.max(1, Number(limitStr)) : undefined;

//   if (key) {
//     const list = getFeaturedListByKey(key);
//     if (!list) {
//       return NextResponse.json(
//         { message: `featured list not found for key="${key}"` },
//         { status: 404 }
//       );
//     }

//     const items = [...list.items]
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .slice(0, limit ?? list.limit ?? list.items.length);

//     const payload: FeaturedList = { ...list, items };
//     return NextResponse.json(payload, { status: 200 });
//   }

//   const lists = getAllFeaturedLists().map((l: FeaturedList) => ({
//     ...l,
//     items: [...l.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//   }));
//   return NextResponse.json({ items: lists }, { status: 200 });
// }

// /** แก้ไขลิสต์ (ชื่อ/คำอธิบาย/limit/รายการสินค้า) */
// export async function PATCH(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   if (!key) {
//     return NextResponse.json({ message: "missing ?key" }, { status: 400 });
//   }

//   const existing = getFeaturedListByKey(key);
//   if (!existing) {
//     return NextResponse.json(
//       { message: `featured list not found for key="${key}"` },
//       { status: 404 }
//     );
//   }

//   const body = await req.json().catch(() => ({}));
//   const next: FeaturedList = {
//     ...existing,
//     title: body.title ?? existing.title,
//     subtitle: body.subtitle ?? existing.subtitle,
//     limit: typeof body.limit === "number" ? body.limit : existing.limit,
//     items: Array.isArray(body.items)
//       ? body.items.map((it: any, i: number) => ({
//           productId: it.productId ?? it.id, // เผื่อ client ส่ง id มา
//           order:
//             typeof it.order === "number"
//               ? it.order
//               : typeof it.index === "number"
//               ? it.index + 1
//               : i + 1,
//         }))
//       : existing.items,
//   };

//   upsertFeaturedList(next);
//   return NextResponse.json(next, { status: 200 });
// }

// v.1.1.2 ================================================

// // src/app/api/mock/featured-lists/route.ts

// import { NextResponse } from "next/server";
// import {
//   getAllFeaturedLists,
//   getFeaturedListByKey,
//   type FeaturedList,
// } from "@/mocks/featured-lists";

// // ให้เป็น dynamic เสมอใน dev/mock
// export const dynamic = "force-dynamic";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const key = searchParams.get("key");
//   const limitStr = searchParams.get("limit");
//   const limit = limitStr ? Math.max(1, Number(limitStr)) : undefined;

//   if (key) {
//     const list = getFeaturedListByKey(key);
//     if (!list) {
//       return NextResponse.json(
//         { message: `featured list not found for key="${key}"` },
//         { status: 404 }
//       );
//     }

//     const items = [...list.items]
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//       .slice(0, limit ?? list.limit ?? list.items.length);

//     const payload: FeaturedList = { ...list, items };
//     return NextResponse.json(payload, { status: 200 });
//   }

//   // ถ้าไม่ส่ง key — คืนรายการทั้งหมด (metadata + items)
//   const lists = getAllFeaturedLists().map((l) => ({
//     ...l,
//     items: [...l.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
//   }));
//   return NextResponse.json({ items: lists }, { status: 200 });
// }

// /**
//  * หมายเหตุ:
//  * - รอบแรกเราเปิดเฉพาะ GET พอเพื่อให้ฝั่งลูกค้าดึงไปแสดงได้ก่อน
//  * - ในเฟสถัดไปค่อยเพิ่ม POST/PATCH/DELETE สำหรับหน้า Admin:
//  *   - POST   /api/mock/featured-lists         (สร้างลิสต์ใหม่)
//  *   - PATCH  /api/mock/featured-lists?key=... (อัปเดตรายการ/ลำดับ/ชื่อ)
//  *   - DELETE /api/mock/featured-lists?key=... (ลบลิสต์)
//  */
