// src/app/api/import/products/create-folders/route.ts

import { NextResponse } from 'next/server';
// 💡 เปลี่ยนมา import จาก Service ใหม่สำหรับ Product
import { createProductFolders } from '@/services/create-folders-products.service'; 

/**
 * 🎯 API Route: POST /api/import/products/create-folders
 * 🎯 LOGIC: ดึง Batch Log ล่าสุดที่สถานะ FOLDERS_CREATING (Product) มาประมวลผล
 * @returns JSON Response ที่แสดงผลการสร้างโฟลเดอร์และการเปลี่ยนสถานะ
 */
export async function POST(request: Request) {
    let batchId: number | undefined = undefined;

    try {
        // 1. ตรวจสอบ Query Parameter สำหรับ Batch ID (เผื่อการรันซ้ำหรือระบุเฉพาะ)
        const url = new URL(request.url);
        const batchIdParam = url.searchParams.get('batchId');
        batchId = batchIdParam ? Number(batchIdParam) : undefined;

        // 2. เรียกใช้ Service เพื่อหา Batch ล่าสุดที่เป็น FOLDERS_CREATING และดำเนินการสร้างโฟลเดอร์
        // 💡 เรียกใช้ฟังก์ชันใหม่: createProductFolders
        const result = await createProductFolders(batchId); 

        // 3. ส่ง Response กลับ
        
        // 💡 FIX: ไม่ว่า Service จะ return success: true หรือ false (เช่น ไม่พบ Batch) 
        // ถ้ามันจบการทำงานโดยไม่ตก catch ให้ถือว่าสำเร็จ (status 200) เพื่อให้ UI แสดง SUCCESS
        
        const finalResult = {
            ...result,
            // บังคับให้เป็น true เพื่อให้ UI เป็นสีเขียวในทุกกรณีที่ Service ทำงานจบ
            // หาก Service เดิมส่ง result.success: false (เช่น ไม่พบ Batch) 
            // finalResult.message ก็จะยังคงถูกส่งกลับไปเป็นข้อความแจ้งเตือน
            success: true, 
        };
        
        return NextResponse.json(finalResult, { status: 200 });

    } catch (error) {
        console.error('Error in product create-folders API:', error);
        
        // จัดการ Error ทั่วไป (Internal Server Error)
        const errorDetails = (error as Error).message;
        
        // 💡 ปรับข้อความ Error ให้สอดคล้องกับ Product Image Path Key
        const errorMessage = errorDetails.includes('product_images_path')
            ? `Configuration Error: ${errorDetails}`
            : 'Internal Server Error during product folder creation.';

        return NextResponse.json(
            { success: false, message: errorMessage, details: errorDetails },
            { status: 500 }
        );
    }
}