// v.1.1.3 =======================================================
// app/api/import/categories/insert-db/route.ts

import { NextResponse } from "next/server";
// 💡 สำคัญ: เปลี่ยนจากการ import insertCategoryData มาเป็น processLatestCategoryBatch
// และลบ CategoryImportItem ที่ไม่จำเป็นสำหรับ Route นี้ออกไป
import { processLatestCategoryBatch } from "@/services/category.service";

/**
 * 💡 API Route สำหรับประมวลผลข้อมูล Category ที่อยู่ใน Batch Log
 * Method: POST
 * หน้าที่: ดึง Batch ล่าสุดที่สถานะ PENDING จาก DB มา Upsert ลงในตาราง ui_categories
 * * สามารถรับ batchId (number) ใน Body เพื่อประมวลผล Batch เฉพาะเจาะจงได้ (Optional)
 */
export async function POST(request: Request) {
    let batchId: number | undefined = undefined;

    try {
        // 1. ตรวจสอบว่ามีการส่ง batchId มาใน Body หรือไม่ (Optional)
        try {
            // เราอ่าน body เพื่อหา batchId เท่านั้น ไม่ได้คาดหวัง array เต็มรูปแบบ
            const body = await request.json();
            if (body && typeof body.batchId === 'number') {
                batchId = body.batchId;
                console.log(`Processing specific Batch ID: ${batchId}`);
            }
        } catch (e) {
            // หาก request body ว่าง หรือไม่เป็น JSON ที่ถูกต้อง (ซึ่งเป็นไปได้เมื่อเรียกแบบ cron job)
            // เราจะไม่ทำอะไร และจะประมวลผล batch ล่าสุดแทน
            //console.log("No valid batchId specified in request body. Processing latest PENDING batch.");
        }

        // 2. เรียก Service Layer เพื่อนำเข้าข้อมูลจาก Batch Log
        // ถ้าส่ง batchId เข้าไป จะประมวลผล Batch นั้น ถ้าไม่ส่ง จะประมวลผล Batch ล่าสุด
        const result = await processLatestCategoryBatch(batchId);

        // 3. ส่ง Response กลับ
        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            // หาก Service return success: false (เช่น ไม่พบ PENDING batch)
            // เราใช้ 200 หรือ 404/400 ตามความเหมาะสม
            // ในกรณีที่ไม่พบ batch ให้ใช้ 404
             if (result.message.includes("No PENDING category import batches found")) {
                 return NextResponse.json(result, { status: 200 }); // ถือว่าสำเร็จในการตรวจสอบ
             } else {
                 return NextResponse.json(result, { status: 400 }); // ข้อผิดพลาดเกี่ยวกับข้อมูล/สถานะ
             }
        }

    } catch (error) {
        console.error("Category Batch Processing failed (Route Level):", error);
        return NextResponse.json(
            { 
                success: false,
                batchId: batchId,
                message: "Internal Server Error during batch processing.", 
                error_details: (error as Error).message 
            },
            { status: 500 }
        );
    }
}

// v.1.1.3 =======================================================

// v.1.1.2 =======================================================
// // app/api/import/categories/insert-db/route.ts

// import { NextResponse } from "next/server";
// // CategoryImportItem ถูกนำเข้าจาก Service Layer ที่ถูกปรับปรุงแล้ว
// import { insertCategoryData, CategoryImportItem } from "@/services/category.service";

// /**
//  * 💡 นี่คือ API Route ที่ n8n และ Admin UI จะเรียกใช้
//  * Method: POST
//  * Body: JSON Array ของ CategoryImportItem
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. รับข้อมูลจาก Body (สมมติว่าเป็น JSON Array ที่ถูกแปลงมาจาก Excel แล้ว)
//     const dataList: CategoryImportItem[] = await request.json();

//     if (!Array.isArray(dataList) || dataList.length === 0) {
//       return NextResponse.json({ error: "Invalid or empty data list provided." }, { status: 400 });
//     }

//     // 2. เรียก Service Layer เพื่อนำเข้าข้อมูล
//     const result = await insertCategoryData(dataList);

//     // 3. ส่ง Response กลับ
//     return NextResponse.json(result, { status: 200 });

//   } catch (error) {
//     console.error("Category Import failed:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error", details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
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