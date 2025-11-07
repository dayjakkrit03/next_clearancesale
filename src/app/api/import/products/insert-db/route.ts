// app/api/import/products/insert-db/route.ts

import { NextResponse } from "next/server";
// 💡 สำคัญ: เปลี่ยนมาใช้ Service สำหรับ Product Insert DB
import { processLatestProductBatch } from "@/services/insert-db-products.service"; 

/**
 * 💡 API Route สำหรับประมวลผลข้อมูล Product ที่อยู่ใน Batch Log
 * Method: POST
 * หน้าที่: ดึง Batch ล่าสุดที่สถานะ PENDING จาก DB มา Upsert ลงในตาราง products_clearance
 * * สามารถรับ batchId (number) ใน Body เพื่อประมวลผล Batch เฉพาะเจาะจงได้ (Optional)
 */
export async function POST(request: Request) {
    // ใช้ BigInt สำหรับ batchId ในกรณีที่ API รับค่ามา แต่เราจะใช้ number ในการรับและแปลงเป็น BigInt ใน Service
    let batchId: number | undefined = undefined; 

    try {
        // 1. ตรวจสอบว่ามีการส่ง batchId มาใน Body หรือไม่ (Optional)
        try {
            // อ่าน body เพื่อหา batchId เท่านั้น
            const body = await request.json();
            if (body && typeof body.batchId === 'number') {
                batchId = body.batchId;
                console.log(`[Product Insert DB Route] Processing specific Batch ID: ${batchId}`);
            }
        } catch (e) {
            // หาก request body ว่าง หรือไม่เป็น JSON ที่ถูกต้อง (เป็นไปได้เมื่อเรียกแบบ cron job)
            // เราจะไม่ทำอะไร และจะประมวลผล batch ล่าสุดที่เป็น PENDING แทน
            // console.log("No valid batchId specified. Processing latest PENDING batch.");
        }

        // 2. เรียก Service Layer เพื่อนำเข้าข้อมูลจาก Batch Log
        // ถ้าส่ง batchId เข้าไป จะประมวลผล Batch นั้น ถ้าไม่ส่ง จะประมวลผล Batch ล่าสุด
        const result = await processLatestProductBatch(batchId);

        // 3. ส่ง Response กลับ
        
        // เราส่ง success: true กลับไปเสมอ เพื่อให้ UI แสดง SUCCESS (สีเขียว)
        // แต่ยังคงส่งผลลัพธ์จาก Service (result.message) กลับไป
        const finalResult = {
            ...result,
            success: true, // บังคับให้เป็น true สำหรับ Status 200
            // หาก Service เดิมส่ง success: false และมี message, message นั้นจะถูกแสดงเป็น Warning/Error ใน UI
        };
        
        return NextResponse.json(finalResult, { status: 200 });


    } catch (error) {
        console.error("[Product Insert DB Route] Batch Processing failed (Route Level):", error);
        return NextResponse.json(
            { 
                success: false, // ยังคงเป็น false สำหรับ Internal Server Error
                batchId: batchId,
                message: "Internal Server Error during product batch processing.", 
                error_details: (error as Error).message 
            },
            { status: 500 }
        );
    }
}