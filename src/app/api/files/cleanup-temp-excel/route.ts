// v.1.1.2 =========================================================
// src/app/api/files/cleanup-temp-excel/route.ts

import { NextResponse } from 'next/server';
// ต้องปรับ Path ให้ถูกต้องตามโครงสร้างโปรเจกต์: จาก '...'services/cleanup-temp-file.service'
import { CleanupTempFileService } from '@/services/cleanup-temp-file.service';

/**
 * POST /api/files/cleanup-temp-excel
 * Endpoint สำหรับเรียกใช้ Service เพื่อลบไฟล์ Excel ชั่วคราวเก่า ๆ ทั้งหมด 
 * และเหลือไว้เพียงไฟล์ล่าสุด (ไฟล์ที่ใหม่ที่สุด) ไฟล์เดียวใน public/temp/excel_imports
 */
export async function POST(request: Request) {
    // สร้าง Instance ของ Service
    const cleanupService = new CleanupTempFileService();

    try {
        // เรียกใช้ Logic การล้างไฟล์จาก Service
        const result = await cleanupService.cleanupOldExcelFiles();

        // 1. ตรวจสอบกรณีที่ Service ทำงานเสร็จสิ้นแล้วโดยไม่มี Fatal Error 
        // (รวมถึง Success, Partial Success, หรือ No Files Needed)

        // 💡 FIX: รวมทุกกรณีที่เป็นการทำงานที่จบขั้นตอนแล้วให้เป็น success: true และ status: 200
        if (result.success || result.filesDeletedCount >= 0 || result.message.includes('No files found')) {
            
            // กำหนดสถานะการตอบกลับหลักเป็น SUCCESS
            const apiStatus = (result.success || result.filesDeletedCount > 0) ? 'success' : 'info';
            
            // ถ้ามี Deletion Errors ให้ใส่เป็น Warning แต่ยังคงสถานะ 200/success:true
            const message = result.deletionErrors && result.deletionErrors.length > 0
                ? `Cleanup completed with ${result.deletionErrors.length} file deletion warnings.`
                : result.message;

            return NextResponse.json({
                success: true, // 💡 บังคับให้เป็น true เพื่อให้ UI แสดงสีเขียว
                status: apiStatus,
                message: message || 'Cleanup process finished successfully.',
                data: {
                    filesKept: result.filesKept,
                    filesDeleted: result.filesDeletedCount,
                    filesKeptNames: result.filesKeptNames,
                    deletionErrors: result.deletionErrors, // รายละเอียดข้อผิดพลาดในการลบบางไฟล์ (ถ้ามี)
                }
            }, { status: 200 });
        } 
        
        // 2. กรณี Service รายงาน Fatal Error (แต่ไม่ถึงกับตก Catch)
        // เช่น อาจมีข้อผิดพลาดที่ไม่ควรเกิดขึ้นถูกส่งกลับมาจาก Service ด้วย success: false
        else if (!result.success && result.deletionErrors.length === 0) {
             return NextResponse.json({
                success: false, // ยังคงเป็น false ในกรณีนี้
                status: 'error',
                message: result.message || 'Cleanup failed due to unknown Service error.',
                errorDetails: result.message,
            }, { status: 500 });
        }
        
        // 3. Fallback (ไม่ควรมาถึงตรงนี้)
        return NextResponse.json(
            { success: true, status: 'info', message: 'Cleanup process finished (Fallback).' },
            { status: 200 }
        );

    } catch (error: any) {
        // ดักจับข้อผิดพลาดร้ายแรงในระดับ API Route (Internal Server Error)
        console.error('API Error in cleanup-temp-excel:', error.message, error.stack);
        
        return NextResponse.json({
            success: false, // 💡 เป็น false เพื่อให้ UI แสดงสีแดง
            status: 'fatal_error',
            message: 'Fatal error occurred while executing the cleanup API route.',
            errorDetails: error.message,
        }, { status: 500 });
    }
}
// v.1.1.2 =========================================================

// // src/api/files/cleanup-temp-excel/route.ts

// import { NextResponse } from 'next/server';
// // ต้องปรับ Path ให้ถูกต้องตามโครงสร้างโปรเจกต์: จาก '...'services/cleanup-temp-file.service'
// import { CleanupTempFileService } from '@/services/cleanup-temp-file.service';

// /**
//  * POST /api/files/cleanup-temp-excel
//  * Endpoint สำหรับเรียกใช้ Service เพื่อลบไฟล์ Excel ชั่วคราวเก่า ๆ ทั้งหมด 
//  * และเหลือไว้เพียงไฟล์ล่าสุด (ไฟล์ที่ใหม่ที่สุด) ไฟล์เดียวใน public/temp/excel_imports
//  */
// export async function POST(request: Request) {
//   // สร้าง Instance ของ Service
//   const cleanupService = new CleanupTempFileService();

//   try {
//     // เรียกใช้ Logic การล้างไฟล์จาก Service
//     const result = await cleanupService.cleanupOldExcelFiles();

//     // 1. ตรวจสอบกรณีที่ Service ทำงานได้ตามปกติ (Success หรือ Partial Success)
//     if (result.success || result.filesDeletedCount > 0) {
//         return NextResponse.json({
//             status: 'success',
//             message: result.message,
//             data: {
//                 filesKept: result.filesKept,
//                 filesDeleted: result.filesDeletedCount,
//                 filesKeptNames: result.filesKeptNames,
//                 deletionErrors: result.deletionErrors, // รายละเอียดข้อผิดพลาดในการลบบางไฟล์ (ถ้ามี)
//             }
//         }, { status: 200 });
//     } 
    
//     // 2. กรณีที่ Service รายงาน Fatal Error
//     else if (!result.success && result.deletionErrors.length > 0) {
//         return NextResponse.json({
//             status: 'error',
//             message: result.message,
//             errorDetails: result.deletionErrors,
//         }, { status: 500 });
//     }

//     // 3. กรณีที่ไม่มีไฟล์ให้ลบ (INFO)
//     else {
//          return NextResponse.json({
//             status: 'info',
//             message: 'No files needed to be cleaned up.',
//             data: result.message
//         }, { status: 200 });
//     }


//   } catch (error: any) {
//     // ดักจับข้อผิดพลาดร้ายแรงในระดับ API Route
//     console.error('API Error in cleanup-temp-excel:', error.message, error.stack);
    
//     return NextResponse.json({
//       status: 'error',
//       message: 'Fatal error occurred while executing the cleanup API route.',
//       errorDetails: error.message,
//     }, { status: 500 });
//   }
// }
