// src/services/insert-db-products.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { Prisma } from "@prisma/client";

// 💡 สำคัญ: ใช้ Enum สำหรับ Product Batch Status
import { import_product_batches_status } from "@prisma/generated/interlink"; 

// 💡 กำหนด Type สำหรับ Product Log Record ที่ดึงมาจาก DB
type ImportProductBatch = NonNullable<Awaited<ReturnType<typeof prismaInterlink.import_product_batches.findFirst>>>;

// 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
export interface ProductImportItem {
    product_sku: string; // ใช้เป็น Unique Key ในการ Upsert
    product_name: string;
    product_brand: string;
    product_description?: string;
    product_price: Prisma.Decimal;
    product_uom?: string;
    category_id?: number;
    sub_id?: number;
    part_id?: number;
    visible: boolean;
    display_order: number;
    // ... ฟิลด์อื่น ๆ ที่จำเป็น
}

// 💡 กำหนด Type สำหรับ Return Value ของ Service
interface ProcessResult {
    success: boolean;
    batchId?: number; 
    count: number;
    message: string;
    error_details?: string;
}

/**
 * 🎯 API: POST /api/import/products/insert-db
 * 1. ดึง Batch Log ล่าสุดที่เป็น PENDING
 * 2. เปลี่ยนสถานะ Batch Log เป็น PROCESSING ทันทีที่ล็อก
 * 3. แปลง JSON data เป็น Array of Products
 * 4. นำเข้าข้อมูล Product เข้าสู่ตาราง products_clearance ด้วย Upsert Logic (Find-Then-Update/Create)
 * 5. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING เพื่อเตรียมเข้าสู่ขั้นตอนต่อไป (สร้างโฟลเดอร์)
 * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุ จะหา Batch ล่าสุดที่เป็น PENDING
 * @returns ผลลัพธ์การประมวลผล
 */
export async function processLatestProductBatch(batchId?: number): Promise<ProcessResult> {
    // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
    await setInterlinkSessionTZ();

    let batchLog: ImportProductBatch | null = null; 
    let dataList: ProductImportItem[] = [];
    let transactionSuccess = false;
    
    // 💡 กำหนดสถานะตาม State Machine
    const PENDING = import_product_batches_status.PENDING;
    const PROCESSING = import_product_batches_status.PROCESSING; // สถานะใหม่เมื่อเริ่มประมวลผล
    const NEXT_STATUS = import_product_batches_status.FOLDERS_CREATING; // สถานะถัดไปหลัง Upsert สำเร็จ
    const ERROR = import_product_batches_status.ERROR;

    try {
        // --- 1. ค้นหา Batch Log ที่ต้องการประมวลผล (สถานะ PENDING เท่านั้น) ---
        if (batchId) {
            batchLog = await prismaInterlink.import_product_batches.findUnique({
                where: { id: BigInt(batchId), status: PENDING } 
            });
        } else {
            // ค้นหา Batch ล่าสุดที่เป็น PENDING
            batchLog = await prismaInterlink.import_product_batches.findFirst({
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
                    : "No PENDING product import batches found for processing.",
            };
        }
        
        const currentBatchId = Number(batchLog.id);

        // --- 2. เปลี่ยนสถานะ Batch เป็น PROCESSING ทันทีที่ล็อกเพื่อป้องกันการประมวลผลซ้ำ ---
        await prismaInterlink.import_product_batches.update({
            where: { id: batchLog.id }, 
            data: {
                status: PROCESSING, // 💡 เปลี่ยนสถานะเป็น PROCESSING
                processed_at: new Date(),
                error_details: null,
            }
        });

        // --- 3. แปลง JSON String เป็น Array of Products ---
        const jsonString = batchLog.product_data; 
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            dataList = JSON.parse(jsonString) as ProductImportItem[];
        }

        if (!Array.isArray(dataList) || dataList.length === 0) {
            // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
            await prismaInterlink.import_product_batches.update({
                where: { id: batchLog.id }, 
                data: {
                    status: ERROR,
                    processed_at: new Date(),
                    error_details: 'Product data in batch log is empty or invalid JSON array.'
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

        // --- 4. Find-Then-Create-or-Update Logic ---
        
        // 4a. ค้นหา product_id ที่มีอยู่แล้วทั้งหมดตาม product_sku (Pre-Transaction Lookup)
        const lookupPromises = dataList.map((item) => 
            prismaInterlink.products_clearance.findFirst({
                where: { product_sku: item.product_sku }, // ใช้ findFirst ได้โดยใช้ฟิลด์ใดก็ได้
                select: { product_id: true }
            })
        );
        const existingProducts = await Promise.all(lookupPromises);


        // 4b. สร้าง Array ของ Operation (Update หรือ Create) สำหรับ Transaction
        const transactionOperations = dataList.map((item, index) => {
            const existingId = existingProducts[index]?.product_id;

            const imageUrlPath = `/public/uploads/products/${item.product_sku}`;
            
            // ข้อมูลสำหรับทั้ง Update และ Create
            const baseData = {
                product_name: item.product_name,
                product_brand: item.product_brand,
                product_description: item.product_description,
                product_price: item.product_price,
                product_uom: item.product_uom,
                category_id: item.category_id,
                sub_id: item.sub_id,
                part_id: item.part_id,
                visible: item.visible,
                display_order: item.display_order,
                image_url: imageUrlPath,
            };

            if (existingId) {
                // UPDATE: ใช้ product_id ใน where clause เพื่อให้เป็น Type-Safe
                return prismaInterlink.products_clearance.update({
                    where: { product_id: existingId }, // 💡 แก้ไข: ใช้ Primary Key ที่ค้นหาได้
                    data: {
                        ...baseData,
                        updated_at: new Date(),
                    }
                });
            } else {
                // CREATE: 
                return prismaInterlink.products_clearance.create({
                    data: {
                        ...baseData,
                        product_sku: item.product_sku, // ต้องเพิ่ม product_sku สำหรับ Create
                    }
                });
            }
        });


        // --- 5. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน ---
        const results = await prismaInterlink.$transaction(transactionOperations);
        transactionSuccess = true;

        // --- 6. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING ---
        await prismaInterlink.import_product_batches.update({
            where: { id: batchLog.id }, 
            data: {
                status: NEXT_STATUS, // 💡 เปลี่ยนสถานะเป็น FOLDERS_CREATING เพื่อไปขั้นตอนต่อไป
                processed_at: new Date(),
            }
        });

        return {
            success: true,
            batchId: currentBatchId,
            count: results.length,
            message: `${results.length} products successfully processed into products_clearance (Batch ID: ${currentBatchId}). Status set to FOLDERS_CREATING.`,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown database error.";
        
        const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;
        
        console.error(`Error processing Product Batch ID ${currentBatchId}:`, error);

        // --- 7. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
        if (batchLog && !transactionSuccess) {
            try {
                await prismaInterlink.import_product_batches.update({
                    where: { id: batchLog.id }, 
                    data: {
                        status: ERROR, // 💡 ใช้ ERROR Enum
                        processed_at: new Date(),
                        error_details: `Database transaction failed during upsert logic: ${errorDetails}`,
                    }
                });
            } catch (logError) {
                console.error("Failed to update product batch status to ERROR:", logError);
            }
        }
        
        // ส่งผลลัพธ์การล้มเหลวกลับไป
        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to process product import batch ID ${currentBatchId}.`,
            error_details: errorDetails,
        };
    }
}