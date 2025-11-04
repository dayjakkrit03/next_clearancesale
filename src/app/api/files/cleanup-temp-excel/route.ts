// src/api/files/cleanup-temp-excel/route.ts

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

    // 1. ตรวจสอบกรณีที่ Service ทำงานได้ตามปกติ (Success หรือ Partial Success)
    if (result.success || result.filesDeletedCount > 0) {
        return NextResponse.json({
            status: 'success',
            message: result.message,
            data: {
                filesKept: result.filesKept,
                filesDeleted: result.filesDeletedCount,
                filesKeptNames: result.filesKeptNames,
                deletionErrors: result.deletionErrors, // รายละเอียดข้อผิดพลาดในการลบบางไฟล์ (ถ้ามี)
            }
        }, { status: 200 });
    } 
    
    // 2. กรณีที่ Service รายงาน Fatal Error
    else if (!result.success && result.deletionErrors.length > 0) {
        return NextResponse.json({
            status: 'error',
            message: result.message,
            errorDetails: result.deletionErrors,
        }, { status: 500 });
    }

    // 3. กรณีที่ไม่มีไฟล์ให้ลบ (INFO)
    else {
         return NextResponse.json({
            status: 'info',
            message: 'No files needed to be cleaned up.',
            data: result.message
        }, { status: 200 });
    }


  } catch (error: any) {
    // ดักจับข้อผิดพลาดร้ายแรงในระดับ API Route
    console.error('API Error in cleanup-temp-excel:', error.message, error.stack);
    
    return NextResponse.json({
      status: 'error',
      message: 'Fatal error occurred while executing the cleanup API route.',
      errorDetails: error.message,
    }, { status: 500 });
  }
}
