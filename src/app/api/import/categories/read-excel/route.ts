// v.1.1.4 =======================================================
// src/app/api/import/categories/read-excel/route.ts

import { NextResponse } from 'next/server';
import { readExcelAndSaveBatch } from '@/services/file.service';

/**
 * 💡 API Route สำหรับขั้นตอนที่ 1: อ่านไฟล์ Excel ล่าสุดจาก Shared Drive และบันทึก Batch Log
 * @method POST
 * @path /api/import/categories/read-excel
 */
export async function POST() {
    try {
        console.log(`[API Step 1/5] Starting Excel read and batch creation process.`);

        // 1. เรียกใช้ Service Function (ค้นหา, Copy, อ่าน, และบันทึก Batch Log)
        const batchResult = await readExcelAndSaveBatch();

        // 2. ส่งคืนผลลัพธ์พร้อม Batch ID และจำนวน Record ที่พบ
        console.log(`[API Step 1/5] Batch created successfully. Batch ID: ${batchResult.batchId}, Records: ${batchResult.totalRecords}`);
        
        return NextResponse.json({
            success: true,
            batchId: Number(batchResult.batchId), // แปลง BigInt เป็น number เพื่อให้ JSON รองรับ
            sourceFilename: batchResult.sourceFilename,
            totalRecords: batchResult.totalRecords,
            message: `Excel file read and Batch ID ${batchResult.batchId} created with ${batchResult.totalRecords} records.`,
        }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Excel processing.';
        console.error(`Error in /api/import/categories/read-excel:`, error);
        
        // 3. จัดการข้อผิดพลาด
        
        // 💡 FIX: สำหรับข้อผิดพลาดเชิง Business Logic (ไฟล์ซ้ำ/Pending) 
        // ตรวจสอบข้อความ Error เพื่อส่ง 200 OK กลับไปให้ UI แสดง SUCCESS
        if (errorMessage.includes('File already imported or pending.')) {
            
            // ใช้ข้อความ Error ทั้งหมดที่ส่งมาจาก Service มาแสดงใน message โดยตรง
            // หากข้อความไม่มี "Import Blocked: " นำหน้า ให้เพิ่มเข้าไป
            const cleanMessage = errorMessage.startsWith('Import Blocked: ') ? errorMessage : `Import Blocked: ${errorMessage}`;
            
            return NextResponse.json(
                { 
                    success: true, // 💡 เปลี่ยนเป็น true เพื่อให้ UI แสดง SUCCESS
                    // ใช้ข้อความ Error ทั้งหมด เพื่อให้ชื่อไฟล์ที่ถูกต้องแสดงผลออกมา
                    message: cleanMessage,
                },
                { status: 200 } // 💡 ใช้ 200 OK เพื่อให้ UI เป็นสีเขียว (Success)
            );
        }
        
        // 4. ข้อผิดพลาดทั่วไป (ทางเทคนิค เช่น Path ผิด, File Read Error)
        return NextResponse.json(
            { success: false, message: `Excel Processing Failed. Details: ${errorMessage}` },
            { status: 500 }
        );
    }
}
// v.1.1.4 =======================================================


// v.1.1.3 =======================================================
// // src/app/api/import/categories/read-excel/route.ts

// import { NextResponse } from 'next/server';
// import { readExcelAndSaveBatch } from '@/services/file.service';

// /**
//  * 💡 API Route สำหรับขั้นตอนที่ 1: อ่านไฟล์ Excel ล่าสุดจาก Shared Drive และบันทึก Batch Log
//  * @method POST
//  * @path /api/import/categories/read-excel
//  */
// export async function POST() {
//     try {
//         console.log(`[API Step 1/4] Starting Excel read and batch creation process.`);

//         // 1. เรียกใช้ Service Function (ค้นหา, Copy, อ่าน, และบันทึก Batch Log)
//         const batchResult = await readExcelAndSaveBatch();

//         // 2. ส่งคืนผลลัพธ์พร้อม Batch ID และจำนวน Record ที่พบ
//         console.log(`[API Step 1/4] Batch created successfully. Batch ID: ${batchResult.batchId}, Records: ${batchResult.totalRecords}`);
        
//         return NextResponse.json({
//             success: true,
//             batchId: Number(batchResult.batchId), // แปลง BigInt เป็น number เพื่อให้ JSON รองรับ
//             sourceFilename: batchResult.sourceFilename,
//             totalRecords: batchResult.totalRecords,
//             message: `Excel file read and Batch ID ${batchResult.batchId} created with ${batchResult.totalRecords} records.`,
//         }, { status: 200 });

//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Excel processing.';
//         console.error(`Error in /api/import/categories/read-excel:`, error);
        
//         // 3. จัดการข้อผิดพลาดและส่งคืนสถานะ 500
        
//         // 💡 NEW: ตรวจสอบข้อความ Error สำหรับไฟล์ซ้ำ และส่งคืน 400 Bad Request
//         if (errorMessage.includes('File already imported or pending.')) {
//             return NextResponse.json(
//                 { success: false, message: `Import Blocked: ${errorMessage}` },
//                 { status: 400 } // ใช้ 400 Bad Request สำหรับข้อผิดพลาดเชิง Business Logic
//             );
//         }
        
//         // 4. ข้อผิดพลาดทั่วไป (เช่น Path ผิด, Network Error, File Read Error)
//         return NextResponse.json(
//             { success: false, message: `Excel Processing Failed. Details: ${errorMessage}` },
//             { status: 500 }
//         );
//     }
// }
// v.1.1.3 =======================================================

// v.1.1.2 =======================================================
// // src/app/api/import/categories/read-excel/route.ts

// import { NextResponse } from 'next/server';
// import { readExcelAndSaveBatch } from '@/services/file.service';

// /**
//  * 💡 API Route สำหรับขั้นตอนที่ 1: อ่านไฟล์ Excel ล่าสุดจาก Shared Drive และบันทึก Batch Log
//  * @method POST
//  * @path /api/import/categories/read-excel
//  */
// export async function POST() {
//     try {
//         console.log(`[API Step 1/4] Starting Excel read and batch creation process.`);

//         // 1. เรียกใช้ Service Function (ค้นหา, Copy, อ่าน, และบันทึก Batch Log)
//         const batchResult = await readExcelAndSaveBatch();

//         // 2. ส่งคืนผลลัพธ์พร้อม Batch ID และจำนวน Record ที่พบ
//         console.log(`[API Step 1/4] Batch created successfully. Batch ID: ${batchResult.batchId}, Records: ${batchResult.totalRecords}`);
        
//         return NextResponse.json({
//             success: true,
//             batchId: Number(batchResult.batchId), // แปลง BigInt เป็น number เพื่อให้ JSON รองรับ
//             sourceFilename: batchResult.sourceFilename,
//             totalRecords: batchResult.totalRecords,
//             message: `Excel file read and Batch ID ${batchResult.batchId} created with ${batchResult.totalRecords} records.`,
//         }, { status: 200 });

//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Excel processing.';
//         console.error(`Error in /api/import/categories/read-excel:`, error);
        
//         // 3. จัดการข้อผิดพลาดและส่งคืนสถานะ 500
//         return NextResponse.json(
//             { success: false, message: `Excel Processing Failed. Details: ${errorMessage}` },
//             { status: 500 }
//         );
//     }
// }

// v.1.1.2 =======================================================

// // src/app/api/import/categories/read-excel/route.ts

// import { NextResponse } from 'next/server';
// import { readExcelAndSaveBatch } from '@/services/file.service';


// export async function POST() {
//     try {
//         // เรียกใช้ฟังก์ชันหลักที่เราสร้างใน file.service.ts
//         const result = await readExcelAndSaveBatch();

//         // เมื่อสำเร็จ, ส่ง Batch ID กลับไป
//         return NextResponse.json({
//             success: true,
//             batchId: result.batchId.toString(), // แปลง BigInt เป็น String
//             totalRecords: result.totalRecords,
//             message: `Successfully read latest Excel file (${result.sourceFilename}) and created PENDING batch log (Batch ID: ${result.batchId}) with ${result.totalRecords} records.`,
//         }, { status: 200 });

//     } catch (error) {
//         console.error('API Error in /read-excel:', error);
        
//         // จัดการ Error ที่มาจาก Service Layer
//         const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred during Excel processing.';

//         return NextResponse.json({
//             success: false,
//             message: `Failed to process Excel import: ${errorMessage}`,
//         }, { status: 500 });
//     }
// }
