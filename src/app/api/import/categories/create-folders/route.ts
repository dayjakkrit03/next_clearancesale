// v.1.1.2 ==========================================================
// src/app/api/import/categories/create-folders/route.ts

import { NextResponse } from 'next/server';
import { createCategoryFolders, FolderCreationItem } from '@/services/file.service';

/**
 * 🎯 API Route: POST /api/import/categories/create-folders
 * ดึงรายการ Category Slugs จาก Body
 * เรียก Service เพื่อสร้างโฟลเดอร์ใน 2 ตำแหน่ง (Local และ Shared Drive)
 */
export async function POST(request: Request) {
  try {
    // 1. รับ JSON Body ที่เป็น Array ของ Category (ที่มี slug)
    const categoryData: FolderCreationItem[] = await request.json();

    if (!Array.isArray(categoryData) || categoryData.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid or empty category data array provided.' }, { status: 400 });
    }
    
    // 2. เรียกใช้ Service เพื่อสร้างโฟลเดอร์
    // Service Layer จะจัดการการดึง Shared Path จาก DB เอง
    const result = await createCategoryFolders(categoryData);

    // 3. ตอบกลับด้วยสถานะสำเร็จ
    return NextResponse.json({ 
        success: true, 
        count: categoryData.length,
        // จำนวนโฟลเดอร์ที่ถูกสร้าง/ตรวจสอบสำเร็จ (นับรวมทั้ง Local และ Shared)
        folders_processed: result.count, 
        message: `${result.count} folder destinations processed successfully (Local and Shared).` 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in create-folders API:', error);
    
    // จัดการ Error ที่มาจาก Service Layer (เช่น Config Path ไม่เจอ)
    const errorMessage = (error as Error).message.includes('Shared graphic path is not configured')
        ? (error as Error).message
        : 'Internal Server Error during folder creation.';

    return NextResponse.json(
      { success: false, message: errorMessage, details: (error as Error).message },
      { status: 500 }
    );
  }
}
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