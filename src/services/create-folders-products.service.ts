// v.1.1.2 =============================================================
// src/services/create-folders-products.service.ts
// 🎯 Service: สร้างโฟลเดอร์สำหรับ Product Images ตามข้อมูลใน Batch Log

import path from 'path';
// 💡 Import dependencies ที่จำเป็นสำหรับ File System
import { mkdir } from 'fs/promises'; 
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// 💡 NEW: Import Enum และ Type จาก Prisma สำหรับ Product Batch Log
// เราสมมติว่า Type เหล่านี้ถูกสร้างแล้วใน @prisma/generated/interlink
import { import_product_batches_status } from "@prisma/generated/interlink"; 
import { import_product_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// === 1. INTERFACES FOR PRODUCT DATA & BATCH LOG ===

// 💡 โครงสร้างข้อมูล Product ที่คาดว่าจะได้รับจาก Batch Log (ชื่อฟิลด์ตาม Schema)
export interface ProductImportItem {
    product_sku: string; // ใช้ product_sku เป็น identifier หลัก
    product_name: string; 
    // ... อาจมีฟิลด์อื่นๆ ที่ถูกเก็บใน product_data
}

// 💡 โครงสร้างสำหรับรับ Input ของ API
export interface FolderCreationItem {
    product_sku: string; // ใช้ product_sku เพื่อสร้างชื่อโฟลเดอร์
}

// 💡 กำหนด Type สำหรับ Return Value ของ Folder Creation Service
export interface FolderProcessResult {
    success: boolean;
    batchId?: number;
    count: number; // จำนวนโฟลเดอร์ที่พยายามสร้าง
    message: string;
    error_details?: string;
}

// 💡 การแก้ไข: คืนค่าการกำหนด Base Upload Path ให้เป็นตามที่คุณต้องการ
// กำหนด Base Upload Path สำหรับ Local Project: [Project Root]/public/uploads
const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');


/**
 * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
 * (รวมอยู่ในไฟล์นี้ตามโครงสร้างตัวอย่างของ Category Service)
 * @param key - คีย์ของ Setting ที่ต้องการดึง
 */
export async function getConfigSetting(key: string): Promise<string | null> {
    try {
        await setInterlinkSessionTZ();
        // 💡 ใช้ตาราง config_setting.findFirst และ setting_key, setting_value ตามโครงสร้างตัวอย่าง
        const setting = await (prismaInterlink as any).config_setting.findFirst({
            where: { setting_key: key },
            select: { setting_value: true },
        });

        return setting?.setting_value || null;
    } catch (error) {
        console.error(`Error fetching config setting '${key}':`, error);
        return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
    }
}


/**
 * 🎯 Service: สร้างโฟลเดอร์สำหรับ Product Images ตามข้อมูลใน Batch Log
 * 💡 PENDING_STATUS: FOLDERS_CREATING
 * 💡 NEXT_STATUS: IMAGES_COPYING
 * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุจะหา Batch ล่าสุด
 * @returns ผลลัพธ์การประมวลผล (FolderProcessResult)
 */
export async function createProductFolders(batchId?: number): Promise<FolderProcessResult> {
    await setInterlinkSessionTZ();

    // 💡 ใช้ Type ที่ Import มาจาก Prisma (import_product_batches)
    let batchLog: import_product_batches | null = null; 
    let dataList: FolderCreationItem[] = [];
    
    // 💡 กำหนดสถานะที่เกี่ยวข้องสำหรับ Product
    const PENDING_STATUS = import_product_batches_status.FOLDERS_CREATING; // สถานะเริ่มต้นของขั้นตอนนี้
    const NEXT_STATUS = import_product_batches_status.IMAGES_COPYING;     // 💡 สถานะถัดไปสำหรับ Product (Copy Images)
    const ERROR_STATUS = import_product_batches_status.ERROR;             // สถานะเมื่อเกิดข้อผิดพลาด
    
    // 💡 กำหนด Path หลักสำหรับอัปโหลด (Local และ Shared)
    let sharedGraphicPath: string;
    let currentBatchId: number | undefined;
    const SHARED_CONFIG_KEY = 'products_images_path'; // 💡 ใช้คีย์เฉพาะสำหรับ Product

    try {
        // --- 1. ดึงค่า Shared Path จาก DB ---
        const configPath = await getConfigSetting(SHARED_CONFIG_KEY);
        if (!configPath) {
            // Error นี้จะเกิดขึ้นหากคุณยังไม่ได้เพิ่ม product_images_path ลงใน config_setting
            throw new Error(`Shared graphic path is not configured in config_setting table (key: ${SHARED_CONFIG_KEY}).`);
        }
        sharedGraphicPath = configPath;
        
        // --- 2. ค้นหา Batch Log ที่ต้องการประมวลผล ---
        // 💡 ใช้ตาราง import_product_batches
        const prismaProduct = prismaInterlink.import_product_batches as any; 
        
        if (batchId) {
            batchLog = await prismaProduct.findUnique({
                where: { id: BigInt(batchId), status: PENDING_STATUS } 
            }) as import_product_batches | null;
        } else {
            // ค้นหา Batch ล่าสุดที่เป็น FOLDERS_CREATING
            batchLog = await prismaProduct.findFirst({
                where: { status: PENDING_STATUS }, 
                orderBy: { id: 'desc' }
            }) as import_product_batches | null;
        }

        if (!batchLog) {
            return {
                success: false,
                count: 0,
                message: batchId 
                    ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
                    : `No product batches found with status ${PENDING_STATUS}.`,
            };
        }
        
        currentBatchId = Number(batchLog.id);

        // --- 3. แปลง JSON String เป็น Array of Products ---
        // 💡 ใช้คอลัมน์ product_data
        const jsonString = (batchLog as any).product_data; 
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            // ดึงเฉพาะ product_sku ที่จำเป็นสำหรับสร้างโฟลเดอร์
            const fullData = JSON.parse(jsonString) as { product_sku: string }[]; 
            // 💡 ใช้ product_sku ในการ map
            dataList = fullData.map(item => ({ product_sku: item.product_sku })); 
        }

        if (!Array.isArray(dataList) || dataList.length === 0) {
            // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
            await prismaProduct.update({
                where: { id: batchLog.id }, 
                data: {
                    status: ERROR_STATUS,
                    processed_at: new Date(),
                    error_details: 'Product data in batch log is empty or invalid JSON array for folder creation.'
                }
            } as any);
            return {
                success: false,
                batchId: currentBatchId,
                count: 0,
                message: `Product Batch ID ${currentBatchId} failed. Data is invalid or empty for folder creation.`,
                error_details: 'Invalid data format in batch log for folder creation.'
            };
        }
        
        // --- 4. เตรียม Path หลักสำหรับ Local และ Shared ---
        // 💡 UPLOAD_ROOT_PATH คือ [Project Root]/public/uploads
        const LOCAL_SUB_PATH = 'products';               
        // 💡 LOCAL_BASE_PATH ตอนนี้คือ [Project Root]/public/uploads/products
        const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, LOCAL_SUB_PATH); 
        const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
        
        // --- 5. สร้างโฟลเดอร์หลัก /products (Local) ก่อน ---
        await mkdir(LOCAL_BASE_PATH, { recursive: true });
        
        // --- 6. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Product SKU ในทั้งสองตำแหน่ง ---
        let foldersProcessedCount = 0; // จำนวนโฟลเดอร์ปลายทางที่พยายามสร้าง (Local + Shared)
        let failedSKUs: string[] = []; // 💡 ใช้ SKUs

        for (const item of dataList) {
            // 💡 ใช้ item.product_sku
            const skuIdentifier = item.product_sku;
            const localDestinationPath = path.join(LOCAL_BASE_PATH, skuIdentifier); 
            const sharedDestinationPath = path.join(SHARED_BASE_PATH, skuIdentifier); 
            
            // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
            const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
                try {
                    await mkdir(folderPath, { recursive: true });
                    foldersProcessedCount++;
                    return true;
                } catch (error) {
                    // หากไม่ใช่ Error: EEXIST (โฟลเดอร์มีอยู่แล้ว) ถือเป็น Failure
                    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
                        // 💡 ใช้ skuIdentifier
                        console.error(`Error creating folder for SKU ${skuIdentifier} (${location}):`, error);
                        return false;
                    }
                    // ถ้ามีอยู่แล้ว ถือว่าสำเร็จในการตรวจสอบ/สร้าง
                    foldersProcessedCount++; 
                    return true;
                }
            };

            // รันพร้อมกัน
            const [localResult, sharedResult] = await Promise.all([
                createFolder(localDestinationPath, 'Local'),
                createFolder(sharedDestinationPath, 'Shared')
            ]);
            
            // หากมีอันใดอันหนึ่งล้มเหลว (และไม่ใช่ EEXIST)
            if (!localResult || !sharedResult) {
                failedSKUs.push(skuIdentifier);
            }
        }
        
        // --- 7. ตรวจสอบความสำเร็จและอัปเดตสถานะ Batch Log ---
        if (failedSKUs.length > 0) {
            const errorMsg = `Product folder creation partially failed. Failed SKUs: ${failedSKUs.join(', ')}. Total items processed: ${dataList.length}`;
            
            // หากมี Product ที่สร้างไม่สำเร็จเลย ให้เป็น ERROR มิฉะนั้นให้ส่งต่อไปขั้นถัดไป
            const finalStatus = (failedSKUs.length < dataList.length) ? NEXT_STATUS : ERROR_STATUS; 

            await prismaProduct.update({
                where: { id: batchLog.id }, 
                data: {
                    status: finalStatus,
                    processed_at: new Date(),
                    error_details: errorMsg,
                }
            } as any); // Type assertion is needed if Prisma client is not fully typed

            return {
                success: (finalStatus === NEXT_STATUS), // สำเร็จถ้าส่งต่อไปขั้นถัดไปได้
                batchId: currentBatchId,
                count: foldersProcessedCount,
                message: `Partially successful. ${dataList.length - failedSKUs.length} product folders completed. ${failedSKUs.length} failed. Status set to ${finalStatus}.`,
                error_details: errorMsg,
            };
        }

        // --- 8. อัปเดตสถานะ Batch Log เป็น IMAGES_COPYING (สำเร็จสมบูรณ์) ---
        await prismaProduct.update({
            where: { id: batchLog.id }, 
            data: {
                status: NEXT_STATUS, // 💡 อัปเดตเป็น IMAGES_COPYING
                processed_at: new Date(),
            }
        } as any); // Type assertion is needed if Prisma client is not fully typed

        return {
            success: true,
            batchId: currentBatchId,
            count: foldersProcessedCount,
            message: `${dataList.length} product folder pairs successfully created/verified (Batch ID: ${currentBatchId}). Status set to ${NEXT_STATUS}.`,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown error during product folder creation process.";
        
        // --- 9. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
        if (batchLog) {
            try {
                // 💡 ใช้ตาราง import_product_batches
                const prismaProduct = prismaInterlink.import_product_batches as any; 
                await prismaProduct.update({
                    where: { id: batchLog.id }, 
                    data: {
                        status: ERROR_STATUS,
                        processed_at: new Date(),
                        error_details: `Product folder creation process failed: ${errorDetails}`,
                    }
                } as any); // Type assertion is needed if Prisma client is not fully typed
            } catch (logError) {
                console.error("Failed to update product batch status to ERROR after main failure:", logError);
            }
        }
        
        console.error(`Fatal Error in createProductFolders for Batch ID ${currentBatchId || 'N/A'}:`, error);

        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to execute product folder creation for Batch ID ${currentBatchId || 'N/A'}.`,
            error_details: errorDetails,
        };
    }
}
// v.1.1.2 =============================================================

// // src/services/create-folders-products.service.ts
// // 🎯 Service: สร้างโฟลเดอร์สำหรับ Product Images ตามข้อมูลใน Batch Log

// import path from 'path';
// // 💡 Import dependencies ที่จำเป็นสำหรับ File System
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// // 💡 NEW: Import Enum และ Type จาก Prisma สำหรับ Product Batch Log
// // เราสมมติว่า Type เหล่านี้ถูกสร้างแล้วใน @prisma/generated/interlink
// import { import_product_batches_status } from "@prisma/generated/interlink"; 
// import { import_product_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// // === 1. INTERFACES FOR PRODUCT DATA & BATCH LOG (UPDATED) ===

// // 💡 โครงสร้างข้อมูล Product ที่คาดว่าจะได้รับจาก Batch Log (ชื่อฟิลด์ตาม Schema)
// export interface ProductImportItem {
//     product_sku: string; // 💡 UPDATED: ใช้ product_sku เป็น identifier หลัก
//     product_name: string; // 💡 UPDATED: ใช้ product_name
//     // ... อาจมีฟิลด์อื่นๆ ที่ถูกเก็บใน product_data
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders (แต่ใน Service นี้จะใช้ Batch Log)
// export interface FolderCreationItem {
//     // 💡 UPDATED: ใช้ product_sku เพื่อสร้างชื่อโฟลเดอร์
//     product_sku: string; 
// }

// // 💡 NEW: กำหนด Type สำหรับ Return Value ของ Folder Creation Service
// export interface FolderProcessResult {
//     success: boolean;
//     batchId?: number;
//     count: number; // จำนวนโฟลเดอร์ที่พยายามสร้าง
//     message: string;
//     error_details?: string;
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// // const UPLOAD_ROOT_PATH = process.env.LOCAL_UPLOAD_ROOT || '/local/data/upload';
// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');


// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * (รวมอยู่ในไฟล์นี้ตามโครงสร้างตัวอย่างของ Category Service)
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
//  */
// export async function getConfigSetting(key: string): Promise<string | null> {
//     try {
//         await setInterlinkSessionTZ();
//         // 💡 ใช้ตาราง config_setting.findFirst และ setting_key, setting_value ตามโครงสร้างตัวอย่าง
//         const setting = await (prismaInterlink as any).config_setting.findFirst({
//             where: { setting_key: key },
//             select: { setting_value: true },
//         });

//         return setting?.setting_value || null;
//     } catch (error) {
//         console.error(`Error fetching config setting '${key}':`, error);
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// /**
//  * 🎯 Service: สร้างโฟลเดอร์สำหรับ Product Images ตามข้อมูลใน Batch Log
//  * 💡 PENDING_STATUS: FOLDERS_CREATING
//  * 💡 NEXT_STATUS: IMAGES_COPYING
//  * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุจะหา Batch ล่าสุด
//  * @returns ผลลัพธ์การประมวลผล (FolderProcessResult)
//  */
// export async function createProductFolders(batchId?: number): Promise<FolderProcessResult> {
//     await setInterlinkSessionTZ();

//     // 💡 ใช้ Type ที่ Import มาจาก Prisma (import_product_batches)
//     let batchLog: import_product_batches | null = null; 
//     let dataList: FolderCreationItem[] = [];
    
//     // 💡 กำหนดสถานะที่เกี่ยวข้องสำหรับ Product
//     const PENDING_STATUS = import_product_batches_status.FOLDERS_CREATING; // สถานะเริ่มต้นของขั้นตอนนี้
//     const NEXT_STATUS = import_product_batches_status.IMAGES_COPYING;     // 💡 สถานะถัดไปสำหรับ Product (Copy Images)
//     const ERROR_STATUS = import_product_batches_status.ERROR;             // สถานะเมื่อเกิดข้อผิดพลาด
    
//     // 💡 กำหนด Path หลักสำหรับอัปโหลด (Local และ Shared)
//     let sharedGraphicPath: string;
//     let currentBatchId: number | undefined;
//     const SHARED_CONFIG_KEY = 'products_images_path'; // 💡 ใช้คีย์เฉพาะสำหรับ Product

//     try {
//         // --- 1. ดึงค่า Shared Path จาก DB ---
//         const configPath = await getConfigSetting(SHARED_CONFIG_KEY);
//         if (!configPath) {
//             throw new Error(`Shared graphic path is not configured in config_setting table (key: ${SHARED_CONFIG_KEY}).`);
//         }
//         sharedGraphicPath = configPath;
        
//         // --- 2. ค้นหา Batch Log ที่ต้องการประมวลผล ---
//         // 💡 ใช้ตาราง import_product_batches
//         const prismaProduct = prismaInterlink.import_product_batches as any; 
        
//         if (batchId) {
//             batchLog = await prismaProduct.findUnique({
//                 where: { id: BigInt(batchId), status: PENDING_STATUS } 
//             }) as import_product_batches | null;
//         } else {
//             // ค้นหา Batch ล่าสุดที่เป็น FOLDERS_CREATING
//             batchLog = await prismaProduct.findFirst({
//                 where: { status: PENDING_STATUS }, 
//                 orderBy: { id: 'desc' }
//             }) as import_product_batches | null;
//         }

//         if (!batchLog) {
//             return {
//                 success: false,
//                 count: 0,
//                 message: batchId 
//                     ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
//                     : `No product batches found with status ${PENDING_STATUS}.`,
//             };
//         }
        
//         currentBatchId = Number(batchLog.id);

//         // --- 3. แปลง JSON String เป็น Array of Products ---
//         // 💡 ใช้คอลัมน์ product_data
//         const jsonString = (batchLog as any).product_data; 
//         if (typeof jsonString === 'string' && jsonString.length > 0) {
//             // ดึงเฉพาะ product_sku ที่จำเป็นสำหรับสร้างโฟลเดอร์
//             // 💡 UPDATED: ใช้ product_sku ใน Type Assertion
//             const fullData = JSON.parse(jsonString) as { product_sku: string }[]; 
//             // 💡 UPDATED: ใช้ product_sku ในการ map
//             dataList = fullData.map(item => ({ product_sku: item.product_sku })); 
//         }

//         if (!Array.isArray(dataList) || dataList.length === 0) {
//             // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
//             await prismaProduct.update({
//                 where: { id: batchLog.id }, 
//                 data: {
//                     status: ERROR_STATUS,
//                     processed_at: new Date(),
//                     error_details: 'Product data in batch log is empty or invalid JSON array for folder creation.'
//                 }
//             });
//             return {
//                 success: false,
//                 batchId: currentBatchId,
//                 count: 0,
//                 message: `Product Batch ID ${currentBatchId} failed. Data is invalid or empty for folder creation.`,
//                 error_details: 'Invalid data format in batch log for folder creation.'
//             };
//         }
        
//         // --- 4. เตรียม Path หลักสำหรับ Local และ Shared ---
//         // 💡 Local Path เป็น 'products'
//         const LOCAL_SUB_PATH = 'products';               
//         const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, LOCAL_SUB_PATH);
//         const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
        
//         // --- 5. สร้างโฟลเดอร์หลัก /products (Local) ก่อน ---
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
        
//         // --- 6. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Product SKU ในทั้งสองตำแหน่ง ---
//         let foldersProcessedCount = 0; // จำนวนโฟลเดอร์ปลายทางที่พยายามสร้าง (Local + Shared)
//         let failedSKUs: string[] = []; // 💡 ใช้ SKUs

//         for (const item of dataList) {
//             // 💡 UPDATED: ใช้ item.product_sku
//             const skuIdentifier = item.product_sku;
//             const localDestinationPath = path.join(LOCAL_BASE_PATH, skuIdentifier); 
//             const sharedDestinationPath = path.join(SHARED_BASE_PATH, skuIdentifier); 
            
//             // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//             const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//                 try {
//                     await mkdir(folderPath, { recursive: true });
//                     foldersProcessedCount++;
//                     return true;
//                 } catch (error) {
//                     // หากไม่ใช่ Error: EEXIST (โฟลเดอร์มีอยู่แล้ว) ถือเป็น Failure
//                     if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                         // 💡 UPDATED: ใช้ skuIdentifier
//                         console.error(`Error creating folder for SKU ${skuIdentifier} (${location}):`, error);
//                         return false;
//                     }
//                     // ถ้ามีอยู่แล้ว ถือว่าสำเร็จในการตรวจสอบ/สร้าง
//                     foldersProcessedCount++; 
//                     return true;
//                 }
//             };

//             // รันพร้อมกัน
//             const [localResult, sharedResult] = await Promise.all([
//                 createFolder(localDestinationPath, 'Local'),
//                 createFolder(sharedDestinationPath, 'Shared')
//             ]);
            
//             // หากมีอันใดอันหนึ่งล้มเหลว (และไม่ใช่ EEXIST)
//             if (!localResult || !sharedResult) {
//                 failedSKUs.push(skuIdentifier);
//             }
//         }
        
//         // --- 7. ตรวจสอบความสำเร็จและอัปเดตสถานะ Batch Log ---
//         if (failedSKUs.length > 0) {
//             const errorMsg = `Product folder creation partially failed. Failed SKUs: ${failedSKUs.join(', ')}. Total items processed: ${dataList.length}`;
            
//             // หากมี Product ที่สร้างไม่สำเร็จเลย ให้เป็น ERROR มิฉะนั้นให้ส่งต่อไปขั้นถัดไป
//             const finalStatus = (failedSKUs.length < dataList.length) ? NEXT_STATUS : ERROR_STATUS; 

//             await prismaProduct.update({
//                 where: { id: batchLog.id }, 
//                 data: {
//                     status: finalStatus,
//                     processed_at: new Date(),
//                     error_details: errorMsg,
//                 }
//             });

//             return {
//                 success: (finalStatus === NEXT_STATUS), // สำเร็จถ้าส่งต่อไปขั้นถัดไปได้
//                 batchId: currentBatchId,
//                 count: foldersProcessedCount,
//                 message: `Partially successful. ${dataList.length - failedSKUs.length} product folders completed. ${failedSKUs.length} failed. Status set to ${finalStatus}.`,
//                 error_details: errorMsg,
//             };
//         }

//         // --- 8. อัปเดตสถานะ Batch Log เป็น IMAGES_COPYING (สำเร็จสมบูรณ์) ---
//         await prismaProduct.update({
//             where: { id: batchLog.id }, 
//             data: {
//                 status: NEXT_STATUS, // 💡 อัปเดตเป็น IMAGES_COPYING
//                 processed_at: new Date(),
//             }
//         });

//         return {
//             success: true,
//             batchId: currentBatchId,
//             count: foldersProcessedCount,
//             message: `${dataList.length} product folder pairs successfully created/verified (Batch ID: ${currentBatchId}). Status set to ${NEXT_STATUS}.`,
//         };

//     } catch (error) {
//         const errorDetails = error instanceof Error ? error.message : "Unknown error during product folder creation process.";
        
//         // --- 9. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
//         if (batchLog) {
//             try {
//                 // 💡 ใช้ตาราง import_product_batches
//                 const prismaProduct = prismaInterlink.import_product_batches as any; 
//                 await prismaProduct.update({
//                     where: { id: batchLog.id }, 
//                     data: {
//                         status: ERROR_STATUS,
//                         processed_at: new Date(),
//                         error_details: `Product folder creation process failed: ${errorDetails}`,
//                     }
//                 });
//             } catch (logError) {
//                 console.error("Failed to update product batch status to ERROR after main failure:", logError);
//             }
//         }
        
//         console.error(`Fatal Error in createProductFolders for Batch ID ${currentBatchId || 'N/A'}:`, error);

//         return {
//             success: false,
//             batchId: currentBatchId,
//             count: 0,
//             message: `Failed to execute product folder creation for Batch ID ${currentBatchId || 'N/A'}.`,
//             error_details: errorDetails,
//         };
//     }
// }