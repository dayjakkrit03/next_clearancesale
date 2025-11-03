// src/app/api/import/categories/read-excel/route.ts

import { NextResponse } from 'next/server';
import { readExcelAndSaveBatch } from '@/services/file.service';


export async function POST() {
    try {
        // เรียกใช้ฟังก์ชันหลักที่เราสร้างใน file.service.ts
        const result = await readExcelAndSaveBatch();

        // เมื่อสำเร็จ, ส่ง Batch ID กลับไป
        return NextResponse.json({
            success: true,
            batchId: result.batchId.toString(), // แปลง BigInt เป็น String
            totalRecords: result.totalRecords,
            message: `Successfully read latest Excel file (${result.sourceFilename}) and created PENDING batch log (Batch ID: ${result.batchId}) with ${result.totalRecords} records.`,
        }, { status: 200 });

    } catch (error) {
        console.error('API Error in /read-excel:', error);
        
        // จัดการ Error ที่มาจาก Service Layer
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred during Excel processing.';

        return NextResponse.json({
            success: false,
            message: `Failed to process Excel import: ${errorMessage}`,
        }, { status: 500 });
    }
}
