// src/app/api/import/products/copy-images/route.ts

import { NextResponse } from 'next/server';
// 💡 เปลี่ยนการ import: นำเข้า Service สำหรับ Product
import { copyProductImages } from '@/services/copy-images-products.service'; 

/**
 * 🎯 API Route: POST /api/import/products/copy-images
 * 🎯 LOGIC: ดึง Product Batch Log ล่าสุดที่สถานะ FOLDERS_CREATING มาประมวลผลการคัดลอกรูปภาพ
 * @returns JSON Response ที่แสดงผลการคัดลอกรูปภาพและการเปลี่ยนสถานะ
 */
export async function POST(request: Request) {
    try {
        // 1. ตรวจสอบ Query Parameter สำหรับ Batch ID (เผื่อการรันซ้ำหรือระบุเฉพาะ)
        const url = new URL(request.url);
        const batchIdParam = url.searchParams.get('batchId');
        const batchId = batchIdParam ? Number(batchIdParam) : undefined;

        // 2. เรียกใช้ Service เพื่อหา Batch ล่าสุดที่เป็น FOLDERS_CREATING และดำเนินการคัดลอกรูปภาพ
        const result = await copyProductImages(batchId); 

        if (!result.success && !result.batchId) {
            // กรณีไม่พบ Batch ที่มีสถานะ FOLDERS_CREATING
            return NextResponse.json({ 
                success: true, // ถือว่าสำเร็จ เพราะไม่มีงานให้ทำ
                message: result.message || 'No FOLDERS_CREATING batch found to start product image copying.' 
            }, { status: 200 });
        }

        // 3. ตอบกลับด้วยสถานะสำเร็จ/ล้มเหลวของการประมวลผล
        return NextResponse.json({ 
            success: result.success, 
            batchId: result.batchId,
            images_processed: result.count, // จำนวนรูปภาพที่ดำเนินการ
            message: result.message,
            error_details: result.error_details,
        }, { status: result.success ? 200 : 500 });

    } catch (error) {
        console.error('Error in product copy-images API:', error);
        
        // จัดการ Error ทั่วไป
        const errorDetails = (error as Error).message;
        // 💡 ปรับปรุงข้อความ Error ให้เฉพาะเจาะจงตาม Service Logic ที่มี
        const errorMessage = errorDetails.includes('Shared graphic path is not configured')
            ? errorDetails
            : 'Internal Server Error during product image copying.';

        return NextResponse.json(
            { success: false, message: errorMessage, details: errorDetails },
            { status: 500 }
        );
    }
}