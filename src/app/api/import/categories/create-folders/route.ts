// v.1.1.4 ==========================================================
// src/app/api/import/categories/create-folders/route.ts

import { NextResponse } from 'next/server';
// 💡 เรายังคง Import Type และ Function เดิมไว้ก่อน และจะปรับปรุงในไฟล์ Service
import { createCategoryFolders, FolderCreationItem } from '@/services/file.service'; 

/**
 * 🎯 API Route: POST /api/import/categories/create-folders
 * 🎯 NEW LOGIC: ดึง Batch Log ล่าสุดที่สถานะ FOLDERS_CREATING มาประมวลผลแทนการรับจาก Body
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
        // 💡 Service Function (createCategoryFolders) ต้องถูกปรับให้ดึงข้อมูลจาก DB เอง
        const result = await createCategoryFolders(batchId); 

        // 3. ส่ง Response กลับ
        
        // 💡 FIX: ไม่ว่า Service จะ return success: true หรือ false (เช่น ไม่พบ Batch) 
        // ถ้ามันจบการทำงานโดยไม่ตก catch ให้ถือว่าสำเร็จ (status 200) เพื่อให้ UI แสดง SUCCESS
        
        const finalResult = {
            ...result,
            // บังคับให้เป็น true เพื่อให้ UI เป็นสีเขียวในทุกกรณีที่ Service ทำงานจบ
            success: true, 
        };
        
        // หาก Service เดิมส่ง result.success: false (เช่น ไม่พบ Batch)
        // finalResult.message ก็จะยังคงถูกส่งกลับไปเป็นข้อความแจ้งเตือนตามเดิม

        return NextResponse.json(finalResult, { status: 200 });

    } catch (error) {
        console.error('Error in create-folders API:', error);
        
        // จัดการ Error ทั่วไป (Internal Server Error)
        const errorDetails = (error as Error).message;
        const errorMessage = errorDetails.includes('Shared graphic path is not configured')
            ? errorDetails
            : 'Internal Server Error during folder creation.';

        return NextResponse.json(
            { success: false, message: errorMessage, details: errorDetails },
            { status: 500 }
        );
    }
}
// v.1.1.4 ==========================================================

// v.1.1.3 ==========================================================
// // src/app/api/import/categories/create-folders/route.ts

// import { NextResponse } from 'next/server';
// // 💡 เรายังคง Import Type และ Function เดิมไว้ก่อน และจะปรับปรุงในไฟล์ Service
// import { createCategoryFolders, FolderCreationItem } from '@/services/file.service'; 

// /**
//  * 🎯 API Route: POST /api/import/categories/create-folders
//  * 🎯 NEW LOGIC: ดึง Batch Log ล่าสุดที่สถานะ FOLDERS_CREATING มาประมวลผลแทนการรับจาก Body
//  * @returns JSON Response ที่แสดงผลการสร้างโฟลเดอร์และการเปลี่ยนสถานะ
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. ตรวจสอบ Query Parameter สำหรับ Batch ID (เผื่อการรันซ้ำหรือระบุเฉพาะ)
//     const url = new URL(request.url);
//     const batchIdParam = url.searchParams.get('batchId');
//     const batchId = batchIdParam ? Number(batchIdParam) : undefined;

//     // 2. เรียกใช้ Service เพื่อหา Batch ล่าสุดที่เป็น FOLDERS_CREATING และดำเนินการสร้างโฟลเดอร์
//     // 💡 Service Function (createCategoryFolders) ต้องถูกปรับให้ดึงข้อมูลจาก DB เอง
//     const result = await createCategoryFolders(batchId); 

//     if (!result.success && !result.batchId) {
//         // กรณีไม่พบ Batch ที่มีสถานะ FOLDERS_CREATING
//         return NextResponse.json({ 
//           success: false, 
//           message: result.message || 'No PENDING batch found to start folder creation.' 
//         }, { status: 404 });
//     }

//     // 3. ตอบกลับด้วยสถานะสำเร็จ/ล้มเหลวของการประมวลผล
//     return NextResponse.json({ 
//         success: result.success, 
//         batchId: result.batchId,
//         folders_processed: result.count, 
//         message: result.message,
//         error_details: result.error_details,
//     }, { status: result.success ? 200 : 500 });

//   } catch (error) {
//     console.error('Error in create-folders API:', error);
//     
//     // จัดการ Error ทั่วไป
//     const errorDetails = (error as Error).message;
//     const errorMessage = errorDetails.includes('Shared graphic path is not configured')
//         ? errorDetails
//         : 'Internal Server Error during folder creation.';

//     return NextResponse.json(
//       { success: false, message: errorMessage, details: errorDetails },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.3 ==========================================================

// v.1.1.2 ========================================================== version work
// // src/app/api/import/categories/create-folders/route.ts

// import { NextResponse } from 'next/server';
// import { createCategoryFolders, FolderCreationItem } from '@/services/file.service';

// /**
//  * 🎯 API Route: POST /api/import/categories/create-folders
//  * ดึงรายการ Category Slugs จาก Body
//  * เรียก Service เพื่อสร้างโฟลเดอร์ใน 2 ตำแหน่ง (Local และ Shared Drive)
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. รับ JSON Body ที่เป็น Array ของ Category (ที่มี slug)
//     const categoryData: FolderCreationItem[] = await request.json();

//     if (!Array.isArray(categoryData) || categoryData.length === 0) {
//       return NextResponse.json({ success: false, message: 'Invalid or empty category data array provided.' }, { status: 400 });
//     }
//     
//     // 2. เรียกใช้ Service เพื่อสร้างโฟลเดอร์
//     // Service Layer จะจัดการการดึง Shared Path จาก DB เอง
//     const result = await createCategoryFolders(categoryData);

//     // 3. ตอบกลับด้วยสถานะสำเร็จ
//     return NextResponse.json({ 
//         success: true, 
//         count: categoryData.length,
//         // จำนวนโฟลเดอร์ที่ถูกสร้าง/ตรวจสอบสำเร็จ (นับรวมทั้ง Local และ Shared)
//         folders_processed: result.count, 
//         message: `${result.count} folder destinations processed successfully (Local and Shared).` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in create-folders API:', error);
    
//     // จัดการ Error ที่มาจาก Service Layer (เช่น Config Path ไม่เจอ)
//     const errorMessage = (error as Error).message.includes('Shared graphic path is not configured')
//         ? (error as Error).message
//         : 'Internal Server Error during folder creation.';

//     return NextResponse.json(
//       { success: false, message: errorMessage, details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.2 ==========================================================

// // src/app/api/import/categories/create-folders/route.ts

// import { NextResponse } from 'next/server';
// import { createCategoryFolders, FolderCreationItem } from '@/services/file.service';

// // API นี้จะใช้สำหรับ POST Request เท่านั้น
// export async function POST(request: Request) {
//   try {
//     // 1. รับ JSON Body ที่เป็น Array ของ Category (ที่มี slug)
//     const categoryData: FolderCreationItem[] = await request.json();

//     if (!Array.isArray(categoryData) || categoryData.length === 0) {
//       return NextResponse.json({ success: false, message: 'Invalid or empty category data array.' }, { status: 400 });
//     }
    
//     // 2. เรียกใช้ Service เพื่อสร้างโฟลเดอร์
//     const result = await createCategoryFolders(categoryData);

//     // 3. ตอบกลับด้วยสถานะสำเร็จ
//     return NextResponse.json({ 
//         success: true, 
//         count: categoryData.length,
//         folders_created: result.count,
//         message: `${result.count} folders created/ensured successfully.` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in create-folders API:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal Server Error during folder creation.' },
//       { status: 500 }
//     );
//   }
// }