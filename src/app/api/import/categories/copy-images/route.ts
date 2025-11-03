// v.1.1.4 =============================================
// src/app/api/import/categories/copy-images/route.ts

import { NextResponse } from 'next/server';
import { copyCategoryImages, ImageProcessRequest } from '@/services/file.service'; 

/**
 * 🎯 API Route: POST /api/import/categories/copy-images
 * ใช้สำหรับ SCAN ไฟล์รูปภาพจาก Shared Drive ตาม SLUG, แปลงเป็น WEBP และบันทึกข้อมูลลง DB
 */
export async function POST(request: Request) {
  try {
    // 1. รับ JSON Body
    const requestData: ImageProcessRequest = await request.json(); 

    // 💡 การดำเนินการ: ลบเงื่อนไข if (!Array.isArray(requestData?.items) || requestData.items.length === 0) 
    // ออกไปก่อน เพื่อให้โค้ดรัน Service Logic ที่ทำงานสำเร็จอยู่แล้ว

    // 2. ตรวจสอบความถูกต้องของ Input อีกครั้งก่อนส่ง
    if (!requestData || !Array.isArray(requestData.items) || requestData.items.length === 0) {
        // หากโค้ดยังมาถึงจุดนี้ได้ นั่นหมายความว่า Next.js ไม่สามารถ Parse JSON ได้เลย
        return NextResponse.json(
            { success: false, message: 'CRITICAL: Failed to parse request JSON or items array is empty. Check Content-Type header or request body format.' },
            { status: 400 } 
        );
    }
    
    // 3. เรียกใช้ Service function (เมื่อ Input ถูกต้องแล้ว)
    const result = await copyCategoryImages(requestData);

    // 4. ตอบกลับด้วยสถานะสำเร็จ (Status 200)
    return NextResponse.json({ 
        success: true, 
        total_categories_requested: requestData.items.length,
        images_processed: result.count,
        message: `Successfully scanned ${requestData.items.length} folders. Total ${result.count} images found, converted to WEBP, and Upserted to DB.` 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in copy-images API (Parsing or Internal):', error);
    
    // 💡 ปรับปรุงตามคำแนะนำของคุณ: ใช้ข้อความ Error จริง
    // จัดการ Error หาก Parsing JSON ล้มเหลวโดยสิ้นเชิง
    if ((error as Error).message.includes('JSON')) {
        return NextResponse.json(
            { success: false, message: `Failed to parse JSON body: ${error}`, details: (error as Error).message },
            { status: 400 }
        );
    }
    
    // จัดการ Error อื่นๆ ที่มาจาก Service Layer
    const errorMessage = (error as Error).message.includes('Shared graphic path is not configured')
        ? (error as Error).message
        : 'Internal Server Error during file scanning, image processing, or DB update.';

    return NextResponse.json(
      { success: false, message: errorMessage, details: (error as Error).message },
      { status: 500 }
    );
  }
}
// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/app/api/import/categories/copy-images/route.ts

// import { NextResponse } from 'next/server';
// import { copyCategoryImages, ImageProcessRequest } from '@/services/file.service'; 

// /**
//  * 🎯 API Route: POST /api/import/categories/copy-images
//  * ใช้สำหรับ SCAN ไฟล์รูปภาพจาก Shared Drive ตาม SLUG, แปลงเป็น WEBP และบันทึกข้อมูลลง DB
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. รับ JSON Body ที่มี Array ของ Category slug ที่ต้องการให้ระบบไป Scan
//     const requestData: ImageProcessRequest = await request.json(); 

//     // 2. 💡 แก้ไข: ต้องมี return เพื่อให้หยุดทำงานทันทีเมื่อ Input ไม่ถูกต้อง
//     if (!Array.isArray(requestData?.items) || requestData.items.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid request body. Requires non-empty "items" array containing category slugs.' }, 
//         { status: 400 } // ส่ง Response 400 ทันที
//       );
//     }
//     
//     // 3. เรียกใช้ Service function (ถ้าโค้ดมาถึงตรงนี้คือ Input ถูกต้องแล้ว)
//     const result = await copyCategoryImages(requestData);

//     // 4. ตอบกลับด้วยสถานะสำเร็จ (Status 200)
//     return NextResponse.json({ 
//         success: true, 
//         total_categories_requested: requestData.items.length,
//         images_processed: result.count,
//         message: `Successfully scanned ${requestData.items.length} folders. Total ${result.count} images found, converted to WEBP, and Upserted to DB.` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in copy-images API (Parsing or Internal):', error);
//     
//     // 💡 แก้ไข: ต้องมี return เพื่อให้หยุดทำงานทันทีเมื่อเกิด Internal Error
    
//     // จัดการ Error หาก Parsing JSON ล้มเหลวโดยสิ้นเชิง
//     if ((error as Error).message.includes('JSON')) {
//         return NextResponse.json(
//             { success: false, message: 'Failed to parse JSON body. Please check Content-Type header.' },
//             { status: 400 }
//         );
//     }
    
//     // จัดการ Error อื่นๆ ที่มาจาก Service Layer
//     const errorMessage = (error as Error).message.includes('Shared graphic path is not configured')
//         ? (error as Error).message
//         : 'Internal Server Error during file scanning, image processing, or DB update.';

//     return NextResponse.json(
//       { success: false, message: errorMessage, details: (error as Error).message },
//       { status: 500 } // ส่ง Response 500 ทันที
//     );
//   }
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/app/api/import/categories/copy-images/route.ts

// import { NextResponse } from 'next/server';
// // 💡 เปลี่ยนจาก ImageCopyRequest เป็น ImageProcessRequest (ตามที่แก้ไขใน file.service.ts)
// import { copyCategoryImages, ImageProcessRequest } from '@/services/file.service'; 

// /**
//  * 🎯 API Route: POST /api/import/categories/copy-images
//  * ใช้สำหรับ SCAN ไฟล์รูปภาพจาก Shared Drive ตาม SLUG, แปลงเป็น WEBP และบันทึกข้อมูลลง DB
//  */
// export async function POST(request: Request) {
//   try {
//     // 1. รับ JSON Body ที่มี Array ของ Category slug ที่ต้องการให้ระบบไป Scan
//     // Request Body ตอนนี้มีแค่ { items: [{ slug: '...' }, ...] }
//     const requestData: ImageProcessRequest = await request.json(); 

//     if (!Array.isArray(requestData.items) || requestData.items.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid request body. Requires non-empty "items" array containing category slugs.' }, 
//         { status: 400 }
//       );
//     }
//     
//     // 2. เรียกใช้ Service function ที่ตอนนี้มี Logic ในการ Scan ไฟล์จาก Shared Drive เองแล้ว
//     const result = await copyCategoryImages(requestData);

//     // 3. ตอบกลับด้วยสถานะสำเร็จ
//     return NextResponse.json({ 
//         success: true, 
//         total_categories_requested: requestData.items.length,
//         images_processed: result.count,
//         message: `Successfully scanned ${requestData.items.length} folders. Total ${result.count} images found, converted to WEBP, and Upserted to DB.` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in copy-images API:', error);
//     
//     // จัดการ Error ที่มาจาก Service Layer (เช่น Config Path ไม่เจอ)
//     const errorMessage = (error as Error).message.includes('Shared graphic path is not configured')
//         ? (error as Error).message
//         : 'Internal Server Error during file scanning, image processing, or DB update.';

//     return NextResponse.json(
//       { success: false, message: errorMessage, details: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.2 =============================================

// // src/app/api/import/categories/copy-images/route.ts

// import { NextResponse } from 'next/server';
// import { copyCategoryImages, ImageCopyRequest } from '@/services/file.service'; // นำเข้าฟังก์ชันและ Type ใหม่

// // API นี้จะใช้สำหรับ POST Request เท่านั้น
// export async function POST(request: Request) {
//   try {
//     // 1. รับ JSON Body ที่มี Source Path และ Array ของ Category (ที่มี slug และ image_filename)
//     const requestData: ImageCopyRequest = await request.json();

//     if (!requestData.source_path || !Array.isArray(requestData.items) || requestData.items.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid request body. Requires "source_path" and non-empty "items" array.' }, 
//         { status: 400 }
//       );
//     }
    
//     // 2. เรียกใช้ Service เพื่อคัดลอกรูปภาพ
//     const result = await copyCategoryImages(requestData);

//     // 3. ตอบกลับด้วยสถานะสำเร็จ
//     return NextResponse.json({ 
//         success: true, 
//         total_requested: requestData.items.length,
//         images_copied: result.count,
//         message: `${result.count} images copied/updated successfully.` 
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in copy-images API:', error);
//     // หาก Source Path เข้าไม่ถึง จะถูก throw ออกมาเป็น error
//     return NextResponse.json(
//       { success: false, message: (error as Error).message || 'Internal Server Error during image copying.' },
//       { status: 500 }
//     );
//   }
// }