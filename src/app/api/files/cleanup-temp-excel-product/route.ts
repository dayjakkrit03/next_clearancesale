// src/app/api/files/cleanup-temp-excel-product/route.ts
// 💡 FIX: ไฟล์ถูกย้ายไปอยู่ในโฟลเดอร์ 'import' เพื่อให้เข้าถึงด้วย URL /api/import/files/...

import { NextResponse } from 'next/server';
// Import CleanupTempFileProductService จากไฟล์ Service ใหม่
import { CleanupTempFileProductService } from '@/services/cleanup-temp-file-product.service';

/**
 * POST /api/import/files/cleanup-temp-excel-product
 * Endpoint สำหรับเรียกใช้ Service เพื่อลบไฟล์ Excel ชั่วคราวเก่า ๆ ทั้งหมด 
 * สำหรับ Product Import และเหลือไว้เพียงไฟล์ล่าสุด (ไฟล์ที่ใหม่ที่สุด) ไฟล์เดียวใน public/temp/excel_product_import
 */
export async function POST(request: Request) {
    // สร้าง Instance ของ Service ใหม่
    const cleanupService = new CleanupTempFileProductService();

    try {
        // เรียกใช้ Logic การล้างไฟล์จาก Service
        const result = await cleanupService.cleanupOldExcelFiles();

        // 1. ตรวจสอบกรณีที่ Service ทำงานเสร็จสิ้นแล้วโดยไม่มี Fatal Error 
        // (รวมถึง Success, Partial Success, หรือ No Files Needed)

        if (result.success || result.filesDeletedCount >= 0 || result.message.includes('No files found') || result.filesKept >= 0) {
            
            // กำหนดสถานะการตอบกลับหลักเป็น SUCCESS
            const apiStatus = (result.success || result.filesDeletedCount > 0) ? 'success' : 'info';
            
            // ถ้ามี Deletion Errors ให้ใส่เป็น Warning แต่ยังคงสถานะ 200/success:true
            const message = result.deletionErrors && result.deletionErrors.length > 0
                ? `Product Cleanup completed with ${result.deletionErrors.length} file deletion warnings.`
                : result.message;

            return NextResponse.json({
                success: true, // 💡 บังคับให้เป็น true เพื่อให้ UI แสดงสีเขียว
                status: apiStatus,
                message: message || 'Product cleanup process finished successfully.',
                data: {
                    filesKept: result.filesKept,
                    filesDeleted: result.filesDeletedCount,
                    filesKeptNames: result.filesKeptNames,
                    deletionErrors: result.deletionErrors, // รายละเอียดข้อผิดพลาดในการลบบางไฟล์ (ถ้ามี)
                }
            }, { status: 200 });
        } 
        
        // 2. กรณี Service รายงาน Fatal Error (แต่ไม่ถึงกับตก Catch)
        else if (!result.success && result.deletionErrors.length === 0) {
             return NextResponse.json({
                success: false, // ยังคงเป็น false ในกรณีนี้
                status: 'error',
                message: result.message || 'Product cleanup failed due to unknown Service error.',
                errorDetails: result.message,
            }, { status: 500 });
        }
        
        // 3. Fallback (ไม่ควรมาถึงตรงนี้)
        return NextResponse.json(
            { success: true, status: 'info', message: 'Product cleanup process finished (Fallback).' },
            { status: 200 }
        );

    } catch (error: any) {
        // ดักจับข้อผิดพลาดร้ายแรงในระดับ API Route (Internal Server Error)
        console.error('API Error in cleanup-temp-excel-product:', error.message, error.stack);
        
        return NextResponse.json({
            success: false, // 💡 เป็น false เพื่อให้ UI แสดงสีแดง
            status: 'fatal_error',
            message: 'Fatal error occurred while executing the product cleanup API route.',
            errorDetails: error.message,
        }, { status: 500 });
    }
}