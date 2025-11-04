// v.1.1.4 ================================================================
// src/services/category.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { Prisma } from "@prisma/client";

// 💡 แก้ไขการ Import Enum ตามที่ผู้ใช้แนะนำ: ใช้ @prisma/generated/interlink
import { import_category_batches_status } from "@prisma/generated/interlink"; 

// 💡 กำหนด Type สำหรับ Category Log Record ที่ดึงมาจาก DB
type ImportCategoryBatch = NonNullable<Awaited<ReturnType<typeof prismaInterlink.import_category_batches.findFirst>>>;

// 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
export interface CategoryImportItem {
    slug: string;
    name: string;
    display_order: number;
    visible: boolean;
}

// 💡 กำหนด Type สำหรับ Return Value ของ Service
interface ProcessResult {
    success: boolean;
    batchId?: number; // คาดหวังเป็น number สำหรับการใช้งานทั่วไป
    count: number;
    message: string;
    error_details?: string;
}

/**
 * 🎯 API: POST /api/import/categories/insert-db
 * 1. ดึง Batch Log ล่าสุดที่เป็น PENDING
 * 2. แปลง JSON data เป็น Array of Categories
 * 3. นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories ด้วย Upsert
 * 4. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING เพื่อเตรียมเข้าสู่ขั้นตอนต่อไปใน State Machine
 * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุ จะหา Batch ล่าสุดที่เป็น PENDING
 * @returns ผลลัพธ์การประมวลผล
 */
export async function processLatestCategoryBatch(batchId?: number): Promise<ProcessResult> {
    // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
    await setInterlinkSessionTZ();

    let batchLog: ImportCategoryBatch | null = null; 
    let dataList: CategoryImportItem[] = [];
    let transactionSuccess = false;
    
    // 💡 กำหนดสถานะตาม State Machine ใหม่
    const PENDING = import_category_batches_status.PENDING;
    // *** สถานะใหม่สำหรับขั้นตอนต่อไป คือการเริ่มสร้างโฟลเดอร์ ***
    const NEXT_STATUS = import_category_batches_status.FOLDERS_CREATING;
    const ERROR = import_category_batches_status.ERROR;

    try {
        // --- 1. ค้นหา Batch Log ที่ต้องการประมวลผล ---
        if (batchId) {
            // ใช้ PENDING Enum โดยตรง และใช้ BigInt(batchId) สำหรับ query
            batchLog = await prismaInterlink.import_category_batches.findUnique({
                where: { id: BigInt(batchId), status: PENDING } 
            });
        } else {
            // ค้นหา Batch ล่าสุดที่เป็น PENDING
            batchLog = await prismaInterlink.import_category_batches.findFirst({
                where: { status: PENDING }, 
                orderBy: { id: 'desc' }
            });
        }

        if (!batchLog) {
            return {
                success: false,
                count: 0,
                message: batchId 
                    ? `Batch ID ${batchId} not found or is not PENDING.`
                    : "No PENDING category import batches found for processing.",
            };
        }
        
        // 💡 แก้ไข BigInt: แปลง batchLog.id (BigInt) เป็น number ทันทีเพื่อใช้ในการส่งคืน
        const currentBatchId = Number(batchLog.id);

        // --- 2. แปลง JSON String เป็น Array of Categories ---
        const jsonString = batchLog.category_data;
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            dataList = JSON.parse(jsonString) as CategoryImportItem[];
        }

        if (!Array.isArray(dataList) || dataList.length === 0) {
            // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
            await prismaInterlink.import_category_batches.update({
                where: { id: batchLog.id }, 
                data: {
                    status: ERROR, // 💡 ใช้ ERROR Enum
                    processed_at: new Date(),
                    error_details: 'Category data in batch log is empty or invalid JSON array.'
                }
            });
            return {
                success: false,
                batchId: currentBatchId,
                count: 0,
                message: `Batch ID ${currentBatchId} failed. Data in batch log is invalid or empty.`,
                error_details: 'Invalid data format in batch log.'
            };
        }

        // --- 3. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต) ---
        const upsertOperations = dataList.map((item) => {
            // 💡 กำหนด image_url ให้ชี้ไปที่โฟลเดอร์ตาม slug ซึ่งจะถูกสร้างในขั้นตอนต่อไป
            const image_url = `/uploads/categories/${item.slug}`;
            
            return prismaInterlink.ui_categories.upsert({
                where: { slug: item.slug },
                update: {
                    name: item.name,
                    image_url: image_url,
                    visible: item.visible,
                    display_order: item.display_order,
                    updated_at: new Date(),
                },
                create: {
                    slug: item.slug,
                    name: item.name,
                    image_url: image_url,
                    visible: item.visible,
                    display_order: item.display_order,
                },
            });
        });

        // --- 4. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน ---
        const results = await prismaInterlink.$transaction(upsertOperations);
        transactionSuccess = true;

        // --- 5. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING ---
        await prismaInterlink.import_category_batches.update({
            where: { id: batchLog.id }, 
            data: {
                status: NEXT_STATUS, // 💡 ใช้ FOLDERS_CREATING Enum ที่ถูกอัปเดตแล้ว
                processed_at: new Date(),
            }
        });

        return {
            success: true,
            batchId: currentBatchId,
            count: results.length,
            message: `${results.length} categories successfully upserted into ui_categories (Batch ID: ${currentBatchId}). Status set to FOLDERS_CREATING.`,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown database error.";
        
        const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;
        
        console.error(`Error processing Batch ID ${currentBatchId}:`, error);

        // --- 6. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
        if (batchLog && !transactionSuccess) {
            try {
                await prismaInterlink.import_category_batches.update({
                    where: { id: batchLog.id }, 
                    data: {
                        status: ERROR, // 💡 ใช้ ERROR Enum
                        processed_at: new Date(),
                        error_details: `Database transaction failed during upsert: ${errorDetails}`,
                    }
                });
            } catch (logError) {
                console.error("Failed to update batch status to FAILED/ERROR:", logError);
            }
        }
        
        // ส่งผลลัพธ์การล้มเหลวกลับไป
        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to process category import batch ID ${currentBatchId}.`,
            error_details: errorDetails,
        };
    }
}

// v.1.1.4 ================================================================

// v.1.1.3 ================================================================ version work
// // src/services/category.service.ts

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import { Prisma } from "@prisma/client";

// // 💡 แก้ไขการ Import Enum ตามที่ผู้ใช้แนะนำ: ใช้ @prisma/generated/interlink
// import { import_category_batches_status } from "@prisma/generated/interlink"; 

// // 💡 กำหนด Type สำหรับ Category Log Record ที่ดึงมาจาก DB
// type ImportCategoryBatch = NonNullable<Awaited<ReturnType<typeof prismaInterlink.import_category_batches.findFirst>>>;

// // 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 กำหนด Type สำหรับ Return Value ของ Service
// interface ProcessResult {
//     success: boolean;
//     batchId?: number; // คาดหวังเป็น number สำหรับการใช้งานทั่วไป
//     count: number;
//     message: string;
//     error_details?: string;
// }

// /**
//  * 🎯 API: POST /api/import/categories/insert-db
//  * 1. ดึง Batch Log ล่าสุดที่เป็น PENDING
//  * 2. แปลง JSON data เป็น Array of Categories
//  * 3. นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories ด้วย Upsert
//  * 4. อัปเดตสถานะ Batch Log เป็น PROCESSED หรือ ERROR (ตาม Schema ที่ถูกต้อง)
//  * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุ จะหา Batch ล่าสุดที่เป็น PENDING
//  * @returns ผลลัพธ์การประมวลผล
//  */
// export async function processLatestCategoryBatch(batchId?: number): Promise<ProcessResult> {
//     // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
//     await setInterlinkSessionTZ();

//     let batchLog: ImportCategoryBatch | null = null; 
//     let dataList: CategoryImportItem[] = [];
//     let transactionSuccess = false;
    
//     // 💡 แก้ไข ENUM ให้ตรงกับ Schema: COMPLETED -> PROCESSED, FAILED -> ERROR
//     const PENDING = import_category_batches_status.PENDING;
//     const PROCESSED = import_category_batches_status.PROCESSED;
//     const ERROR = import_category_batches_status.ERROR;

//     try {
//         // --- 1. ค้นหา Batch Log ที่ต้องการประมวลผล ---
//         if (batchId) {
//             // ใช้ PENDING Enum โดยตรง และใช้ BigInt(batchId) สำหรับ query
//             batchLog = await prismaInterlink.import_category_batches.findUnique({
//                 where: { id: BigInt(batchId), status: PENDING } 
//             });
//         } else {
//             // ค้นหา Batch ล่าสุดที่เป็น PENDING
//             batchLog = await prismaInterlink.import_category_batches.findFirst({
//                 where: { status: PENDING }, 
//                 orderBy: { id: 'desc' }
//             });
//         }

//         if (!batchLog) {
//             return {
//                 success: false,
//                 count: 0,
//                 message: batchId 
//                     ? `Batch ID ${batchId} not found or is not PENDING.`
//                     : "No PENDING category import batches found for processing.",
//             };
//         }
        
//         // 💡 แก้ไข BigInt: แปลง batchLog.id (BigInt) เป็น number ทันทีเพื่อใช้ในการส่งคืน
//         const currentBatchId = Number(batchLog.id);

//         // --- 2. แปลง JSON String เป็น Array of Categories ---
//         const jsonString = batchLog.category_data;
//         if (typeof jsonString === 'string' && jsonString.length > 0) {
//             dataList = JSON.parse(jsonString) as CategoryImportItem[];
//         }

//         if (!Array.isArray(dataList) || dataList.length === 0) {
//             // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
//             await prismaInterlink.import_category_batches.update({
//                 where: { id: batchLog.id }, 
//                 data: {
//                     status: ERROR, // 💡 ใช้ ERROR Enum
//                     processed_at: new Date(),
//                     error_details: 'Category data in batch log is empty or invalid JSON array.'
//                 }
//             });
//             return {
//                 success: false,
//                 batchId: currentBatchId,
//                 count: 0,
//                 message: `Batch ID ${currentBatchId} failed. Data in batch log is invalid or empty.`,
//                 error_details: 'Invalid data format in batch log.'
//             };
//         }

//         // --- 3. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต) ---
//         const upsertOperations = dataList.map((item) => {
//             const image_url = `/uploads/categories/${item.slug}`;
            
//             return prismaInterlink.ui_categories.upsert({
//                 where: { slug: item.slug },
//                 update: {
//                     name: item.name,
//                     image_url: image_url,
//                     visible: item.visible,
//                     display_order: item.display_order,
//                     updated_at: new Date(),
//                 },
//                 create: {
//                     slug: item.slug,
//                     name: item.name,
//                     image_url: image_url,
//                     visible: item.visible,
//                     display_order: item.display_order,
//                 },
//             });
//         });

//         // --- 4. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน ---
//         const results = await prismaInterlink.$transaction(upsertOperations);
//         transactionSuccess = true;

//         // --- 5. อัปเดตสถานะ Batch Log เป็น PROCESSED ---
//         await prismaInterlink.import_category_batches.update({
//             where: { id: batchLog.id }, 
//             data: {
//                 status: PROCESSED, // 💡 ใช้ PROCESSED Enum
//                 processed_at: new Date(),
//             }
//         });

//         return {
//             success: true,
//             batchId: currentBatchId,
//             count: results.length,
//             message: `${results.length} categories successfully upserted into ui_categories (Batch ID: ${currentBatchId}).`,
//         };

//     } catch (error) {
//         const errorDetails = error instanceof Error ? error.message : "Unknown database error.";
        
//         const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;
        
//         console.error(`Error processing Batch ID ${currentBatchId}:`, error);

//         // --- 6. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
//         if (batchLog && !transactionSuccess) {
//             try {
//                 await prismaInterlink.import_category_batches.update({
//                     where: { id: batchLog.id }, 
//                     data: {
//                         status: ERROR, // 💡 ใช้ ERROR Enum
//                         processed_at: new Date(),
//                         error_details: `Database transaction failed during upsert: ${errorDetails}`,
//                     }
//                 });
//             } catch (logError) {
//                 console.error("Failed to update batch status to FAILED/ERROR:", logError);
//             }
//         }
        
//         // ส่งผลลัพธ์การล้มเหลวกลับไป
//         return {
//             success: false,
//             batchId: currentBatchId,
//             count: 0,
//             message: `Failed to process category import batch ID ${currentBatchId}.`,
//             error_details: errorDetails,
//         };
//     }
// }

// v.1.1.3 ================================================================

// v.1.1.2 ================================================================
//  // src/services/category.service.ts

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// // 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// // **ปรับปรุง:** ลบ image_filename ออก เนื่องจาก API นี้จะเก็บแค่ Path โฟลเดอร์
// export interface CategoryImportItem {
//   slug: string;
//   name: string;
//   display_order: number;
//   visible: boolean;
//   // เราอาจเพิ่ม users_action: number; ในภายหลังถ้าจำเป็นต้องระบุผู้ใช้งาน
// }

// /**
//  * 🎯 API: POST /api/import/categories/insert-db
//  * นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories (ใน Interlink DB)
//  * โดยใช้ Upsert เพื่อให้สามารถอัปเดตข้อมูลที่มี slug ซ้ำได้
//  * @param dataList - array ของข้อมูล Category ที่ได้จากไฟล์ Excel
//  */
// export async function insertCategoryData(dataList: CategoryImportItem[]) {
//   // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
//   await setInterlinkSessionTZ();

//   // 2. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต)
//   const upsertOperations = dataList.map((item) => {
//     // **ปรับปรุง:** กำหนดค่า image_url เป็น Path โฟลเดอร์เท่านั้น: /uploads/categories/[slug]
//     const image_url = `/uploads/categories/${item.slug}`;
//     
//     return prismaInterlink.ui_categories.upsert({
//       where: { slug: item.slug },
//       update: {
//         name: item.name,
//         // ใช้ image_url ใหม่
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         updated_at: new Date(),
//       },
//       create: {
//         slug: item.slug,
//         name: item.name,
//         // ใช้ image_url ใหม่
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         // created_at: New Date() (ใช้ค่า default)
//       },
//     });
//   });

//   // 3. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน
//   const results = await prismaInterlink.$transaction(upsertOperations);
//   
//   return {
//     success: true,
//     count: results.length,
//     message: `${results.length} categories upserted successfully in Interlink DB.`,
//   };
// }
// v.1.1.2 ================================================================

// // src/services/category.service.ts
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";

// // 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// export interface CategoryImportItem {
//   slug: string;
//   name: string;
//   image_filename: string; // ชื่อไฟล์รูปภาพ (เพื่อใช้ในขั้นตอนถัดไป)
//   display_order: number;
//   visible: boolean;
//   // เราอาจเพิ่ม users_action: number; ในภายหลังถ้าจำเป็นต้องระบุผู้ใช้งาน
// }

// /**
//  * 🎯 API: POST /api/import/categories/insert-db
//  * นำเข้าข้อมูล Category เข้าสู่ตาราง ui_categories (ใน Interlink DB)
//  * โดยใช้ Upsert เพื่อให้สามารถอัปเดตข้อมูลที่มี slug ซ้ำได้
//  * @param dataList - array ของข้อมูล Category ที่ได้จากไฟล์ Excel
//  */
// export async function insertCategoryData(dataList: CategoryImportItem[]) {
//   // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
//   await setInterlinkSessionTZ();

//   // 2. เตรียมข้อมูลสำหรับ Upsert (สร้างหรืออัปเดต)
//   const upsertOperations = dataList.map((item) => {
//     // กำหนดค่า image_url: /categories/[slug]/[filename]
//     const image_url = `/uploads/categories/${item.slug}/${item.image_filename}`;
    
//     return prismaInterlink.ui_categories.upsert({
//       where: { slug: item.slug },
//       update: {
//         name: item.name,
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         updated_at: new Date(),
//       },
//       create: {
//         slug: item.slug,
//         name: item.name,
//         image_url: image_url,
//         visible: item.visible,
//         display_order: item.display_order,
//         // created_at: New Date() (ใช้ค่า default)
//       },
//     });
//   });

//   // 3. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน
//   const results = await prismaInterlink.$transaction(upsertOperations);
  
//   return {
//     success: true,
//     count: results.length,
//     message: `${results.length} categories upserted successfully in Interlink DB.`,
//   };
// }