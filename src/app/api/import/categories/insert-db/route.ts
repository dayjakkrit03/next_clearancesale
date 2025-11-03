// v.1.1.4 =======================================================

// v.1.1.4 =======================================================

// v.1.1.3 =======================================================

// v.1.1.3 =======================================================

// v.1.1.2 =======================================================
// app/api/import/categories/insert-db/route.ts

import { NextResponse } from "next/server";
// CategoryImportItem ถูกนำเข้าจาก Service Layer ที่ถูกปรับปรุงแล้ว
import { insertCategoryData, CategoryImportItem } from "@/services/category.service";

/**
 * 💡 นี่คือ API Route ที่ n8n และ Admin UI จะเรียกใช้
 * Method: POST
 * Body: JSON Array ของ CategoryImportItem
 */
export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลจาก Body (สมมติว่าเป็น JSON Array ที่ถูกแปลงมาจาก Excel แล้ว)
    const dataList: CategoryImportItem[] = await request.json();

    if (!Array.isArray(dataList) || dataList.length === 0) {
      return NextResponse.json({ error: "Invalid or empty data list provided." }, { status: 400 });
    }

    // 2. เรียก Service Layer เพื่อนำเข้าข้อมูล
    const result = await insertCategoryData(dataList);

    // 3. ส่ง Response กลับ
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Category Import failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
// v.1.1.2 =======================================================

// // app/api/import/categories/insert-db/route.ts
// import { NextResponse } from "next/server";
// import { insertCategoryData, CategoryImportItem } from "@/services/category.service";

// /**
//  * 💡 นี่คือ API Route ที่ n8n และ Admin UI จะเรียกใช้
//  * Method: POST
//  * Body: JSON Array ของ CategoryImportItem
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. รับข้อมูลจาก Body (สมมติว่าเป็น JSON Array ที่ถูกแปลงมาจาก Excel แล้ว)
//     const dataList: CategoryImportItem[] = await request.json();

//     if (!Array.isArray(dataList) || dataList.length === 0) {
//       return NextResponse.json({ error: "Invalid or empty data list provided." }, { status: 400 });
//     }

//     // 2. เรียก Service Layer เพื่อนำเข้าข้อมูล
//     const result = await insertCategoryData(dataList);

//     // 3. ส่ง Response กลับ
//     return NextResponse.json(result, { status: 200 });

//   } catch (error) {
//     console.error("Category Import failed:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }