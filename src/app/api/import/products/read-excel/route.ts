// v.1.1.2 ============================================================
// src/app/api/import/products/read-excel/route.ts

import { NextResponse } from 'next/server';
import { FileReadExcelProductService } from "@/services/file-read-excel-product.service";

/**
 * @method POST
 * @description API endpoint to trigger the reading of the latest product excel file
 * from a shared path, copy it locally, parse it, and save the batch log.
 */
export async function POST(req: Request) {
    console.log("[API Step 1/5 - Product] Starting Excel read and batch creation process.");
    
    try {
        const service = new FileReadExcelProductService();
        const batchResult = await service.readExcelAndSaveBatch();

        // Successful processing (Status 200 OK)
        console.log(`[API Step 1/5 - Product] Batch created successfully. Batch ID: ${batchResult.batchId}, Records: ${batchResult.totalRecords}`);

        return NextResponse.json({ 
            success: true, 
            batchId: Number(batchResult.batchId),
            sourceFilename: batchResult.sourceFilename,
            totalRecords: batchResult.totalRecords,
            message: `Excel file read and Batch ID ${batchResult.batchId} created with ${batchResult.totalRecords} records.`,
        }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Excel processing.';
        
        // 1. Handle Controlled Business Errors (File already imported or pending)
        if (errorMessage.includes('File already imported or pending')) {
            
            // 💡 การเปลี่ยนแปลง: ใช้ console.log แทน console.error เพื่อลดความน่ากลัวใน Log
            console.log(`[API Step 1/5 - Blocked] File import blocked: ${errorMessage}`);
            
            // ทำให้ message ตรงตามที่ Category ทำ: success: true, status: 200
            const cleanMessage = errorMessage.startsWith('Import Blocked: ') ? errorMessage : `Import Blocked: ${errorMessage}`;
            
            return NextResponse.json(
                { 
                    success: true, // 💡 UI จะแสดงเป็นสีเขียว
                    message: cleanMessage, // ใช้ข้อความ Error เป็นข้อความเตือนใน UI
                },
                { status: 200 } 
            );
        }

        // 2. Handle Unexpected Server Errors (Status 500 Internal Server Error)
        // 💡 สำหรับ Technical Error ที่ไม่คาดคิด ให้ใช้ console.error ตามปกติ
        console.error("Error in /api/import/products/read-excel:", error);

        return NextResponse.json(
            { success: false, message: `Excel Processing Failed. Details: ${errorMessage}` },
            { status: 500 }
        );
    }
}
// v.1.1.2 ============================================================

// // src/app/api/import/products/read-excel/route.ts

// import { NextResponse } from 'next/server';
// // 💡 เปลี่ยนการ Import ไปใช้ Service Class ใหม่ที่จัดการ Product Excel โดยเฉพาะ
// // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป
// import { FileReadExcelProductService } from '@/services/file-read-excel-product.service';

// /**
//  * 💡 API Route สำหรับขั้นตอนที่ 1: อ่านไฟล์ Excel ล่าสุดจาก Shared Drive และบันทึก Batch Log
//  * - ไฟล์ Excel ที่ใช้: products_clearance_yyyymmdd.xlsx
//  * - Path ที่ใช้: อ่านจาก config_setting:excel_products_path
//  * @method POST
//  * @path /api/import/products/read-excel
//  */
// export async function POST() {
//     try {
//         console.log(`[API Step 1/5 - Product] Starting Excel read and batch creation process.`);

//         // 1. สร้าง Instance ของ Service และเรียกใช้ฟังก์ชันหลัก
//         const excelService = new FileReadExcelProductService();
//         const batchResult = await excelService.readExcelAndSaveBatch();

//         // 2. ส่งคืนผลลัพธ์พร้อม Batch ID และจำนวน Record ที่พบ
//         console.log(`[API Step 1/5 - Product] Batch created successfully. Batch ID: ${batchResult.batchId}, Records: ${batchResult.totalRecords}`);
        
//         return NextResponse.json({
//             success: true,
//             batchId: Number(batchResult.batchId), // แปลง BigInt เป็น number เพื่อให้ JSON รองรับ
//             sourceFilename: batchResult.sourceFilename,
//             totalRecords: batchResult.totalRecords,
//             message: `Product Excel file read and Batch ID ${batchResult.batchId} created with ${batchResult.totalRecords} records.`,
//         }, { status: 200 });

//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Excel processing.';
//         console.error(`Error in /api/import/products/read-excel:`, error);
        
//         // 3. จัดการข้อผิดพลาด
        
//         // 💡 FIX: สำหรับข้อผิดพลาดเชิง Business Logic (ไฟล์ซ้ำ/Pending) 
//         // ตรวจสอบข้อความ Error เพื่อส่ง 200 OK กลับไปให้ UI แสดง SUCCESS
//         if (errorMessage.includes('File already imported or pending.') || errorMessage.includes('Import Blocked:')) {
            
//             // ใช้ข้อความ Error ทั้งหมดที่ส่งมาจาก Service มาแสดงใน message โดยตรง
//             const cleanMessage = errorMessage.startsWith('Import Blocked: ') ? errorMessage : `Import Blocked: ${errorMessage}`;
            
//             return NextResponse.json(
//                 { 
//                     success: true, // 💡 เปลี่ยนเป็น true เพื่อให้ UI แสดง SUCCESS
//                     // ใช้ข้อความ Error ทั้งหมด เพื่อให้ชื่อไฟล์ที่ถูกต้องแสดงผลออกมา
//                     message: cleanMessage,
//                 },
//                 { status: 200 } // 💡 ใช้ 200 OK เพื่อให้ UI เป็นสีเขียว (Success)
//             );
//         }
        
//         // 4. ข้อผิดพลาดทั่วไป (ทางเทคนิค เช่น Path ผิด, File Read Error)
//         return NextResponse.json(
//             { success: false, message: `Product Excel Processing Failed. Details: ${errorMessage}` },
//             { status: 500 }
//         );
//     }
// }