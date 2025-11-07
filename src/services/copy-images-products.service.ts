// v.1.1.2 =============================================================================
// src/services/copy-images-products.service.ts

// src/services/copy-images-products.service.ts
// 🎯 Service: Scan Product Shared Drive folders, convert to WEBP, copy, and Upsert DB
// 💡 Logic adapted from Category Service

import path from 'path';
import { readFile, readdir, mkdir } from 'fs/promises';
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import sharp from 'sharp'; // Required: npm install sharp
import { import_product_batches_status, import_product_batches, images_products } from "@prisma/generated/interlink"; 

// === 1. INTERFACES (Required for return type) ===
/**
 * Interface for the result returned by the image processing service.
 */
export interface ImageProcessResult {
    success: boolean;
    batchId?: number;
    count: number;
    message: string;
    error_details?: string | null;
}

// ===================================================================================
// 💡 Helper function: Fetches Config value from config_setting table.
// ===================================================================================

/**
 * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
 * @param key - คีย์ของ Setting ที่ต้องการดึง
 */
export async function getConfigSetting(key: string): Promise<string | null> {
    try {
        await setInterlinkSessionTZ();
        const setting = await prismaInterlink.config_setting.findFirst({
            where: { setting_key: key },
            select: { setting_value: true },
        });

        return setting?.setting_value || null;
    } catch (error) {
        console.error(`Error fetching config setting '${key}':`, error);
        return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
    }
}
// ===================================================================================


// 💡 Define Base Upload Path for Local Project (based on existing code)
const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');

// --- Types for internal data handling ---

/** Defines the structure of the product SKU data parsed from the batch log. */
interface ProductSkuDataItem {
    product_sku: string;
}

/** Defines the structure for an image item collected for processing. */
interface ImageToProcess {
    product_sku: string;
    filename: string;
    display_order: number;
}

// Define structure for the product ID/SKU retrieved from products_clearance
type ProductIdSku = { product_id: number; product_sku: string };

// Define a type for the image record, assuming ID is BigInt as is common with Prisma/MySQL.
type ImageRecord = images_products & { id: bigint };


/**
 * 🎯 Service: Scan Shared Drive folder, convert to WEBP, and Upsert Product Images data
 * 💡 PREREQUISITE_STATUS: IMAGES_COPYING (Status set by previous step when complete)
 * 💡 PROCESSING_STATUS: IMAGES_COPYING
 * 💡 NEXT_STATUS: COMPLETED
 * @param batchId - (Optional) ID of the Batch to process. If not provided, the latest PENDING batch is used.
 * @returns Processing result (ImageProcessResult)
 */
export async function copyProductImages(batchId?: number): Promise<ImageProcessResult> {
    await setInterlinkSessionTZ();

    let batchLog: import_product_batches | null = null;
    let productSKUs: string[] = [];
    let currentBatchId: number | undefined;

    // 🔴 FIX: เปลี่ยน PENDING_STATUS ให้เป็นสถานะที่คุณแจ้งว่า API ก่อนหน้าตั้งค่าไว้
    const PENDING_STATUS = import_product_batches_status.IMAGES_COPYING; // สถานะที่ Batch Log ต้องมีเพื่อรอการประมวลผล
    const PROCESSING_STATUS = import_product_batches_status.PROCESSING; // สถานะขณะประมวลผล (ในกรณีนี้คือตัวเดียวกัน)
    const NEXT_STATUS = import_product_batches_status.COMPLETED;
    const ERROR_STATUS = import_product_batches_status.ERROR;

    const SHARED_CONFIG_KEY = 'products_images_path';

    const prismaProductBatch = prismaInterlink.import_product_batches;

    try {
        // --- 1. Fetch Shared Path and define Local Base Path ---
        const sharedGraphicPath = await getConfigSetting(SHARED_CONFIG_KEY); // Now getConfigSetting is defined
        if (!sharedGraphicPath) {
            throw new Error(`Shared graphic path is not configured (key: ${SHARED_CONFIG_KEY}). Please ensure the value is set in config_setting table.`);
        }

        const PRODUCT_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'products');

        // --- 2. Find the Batch Log to process ---
        // 💡 NOTE: ตอนนี้จะค้นหา Batch ที่มี status เป็น IMAGES_COPYING
        if (batchId) {
            batchLog = await prismaProductBatch.findUnique({
                where: { id: BigInt(batchId), status: PENDING_STATUS }
            }) as import_product_batches | null;
        } else {
            batchLog = await prismaProductBatch.findFirst({
                where: { status: PENDING_STATUS },
                orderBy: { id: 'desc' }
            }) as import_product_batches | null;
        }

        if (!batchLog) {
            return {
                success: true,
                count: 0,
                message: batchId
                    ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
                    : `No product batches found with status ${PENDING_STATUS}.`,
            };
        }

        currentBatchId = Number(batchLog.id);
        console.log(`Starting product image copying for Batch ID: ${currentBatchId}`);

        // --- 3. Set Batch Status to IMAGES_COPYING (Prevent re-running) ---
        // 💡 ถึงแม้ว่า PENDING_STATUS และ PROCESSING_STATUS จะเป็นค่าเดียวกัน
        // การ Update นี้ยังช่วยในการบันทึก Timestamp ว่าเริ่มการประมวลผล
        await prismaProductBatch.update({
            where: { id: batchLog.id },
            data: { status: PROCESSING_STATUS }
        });

        // --- 4. Convert JSON String to Array of Product SKUs ---
        const jsonString = (batchLog as import_product_batches & { product_data: string }).product_data;
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            try {
                const fullData = JSON.parse(jsonString) as ProductSkuDataItem[];
                productSKUs = fullData
                    .map(item => item.product_sku)
                    .filter(sku => typeof sku === 'string' && sku.trim().length > 0);
            } catch (jsonError) {
                throw new Error(`Failed to parse product_data JSON for Batch ID ${currentBatchId}. Error: ${(jsonError as Error).message}`);
            }
        }

        if (productSKUs.length === 0) {
            const message = `Product data in batch log is empty or invalid JSON array for image copying in Batch ID ${currentBatchId}. Setting status to ${NEXT_STATUS}.`;
            await prismaProductBatch.update({
                where: { id: batchLog.id },
                data: { status: NEXT_STATUS, processed_at: new Date() }
            });
            return { success: true, batchId: currentBatchId, count: 0, message };
        }

        let allImagesToProcess: ImageToProcess[] = [];
        let folderAccessErrors: string[] = [];

        // --- 5. Loop to Scan files in each Product folder (Shared Drive) ---
        for (const sku of productSKUs) {
            const sharedFolder = path.join(sharedGraphicPath, sku);

            try {
                const filenames = await readdir(sharedFolder);

                const imageFiles = filenames
                    .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
                    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                imageFiles.forEach((filename, index) => {
                    allImagesToProcess.push({
                        product_sku: sku,
                        filename: filename,
                        display_order: index,
                    });
                });

            } catch (error) {
                const errorMsg = `Could not access shared folder for SKU: ${sku}. Error: ${(error as Error).message}`;
                console.warn(`Warning: ${errorMsg}`);
                folderAccessErrors.push(sku);
            }
        }

        // --- 6. Check if there are images to process ---
        if (allImagesToProcess.length === 0) {
            const message = `Completed batch ${currentBatchId}. Found 0 images to process across ${productSKUs.length} products.`;

            await prismaProductBatch.update({
                where: { id: batchLog.id },
                data: {
                    status: NEXT_STATUS,
                    processed_at: new Date(),
                    error_details: folderAccessErrors.length > 0 ? `Folder access failures for SKUs: ${folderAccessErrors.join(', ')}` : null,
                }
            });

            return { success: true, batchId: currentBatchId, count: 0, message: message };
        }

        // --- 7. Fetch all relevant Product IDs (Using the correct table: products_clearance) ---
        const skusWithImages = [...new Set(allImagesToProcess.map(i => i.product_sku))];
        const products: ProductIdSku[] = await prismaInterlink.products_clearance.findMany({ 
            where: { product_sku: { in: skusWithImages } },
            select: { product_id: true, product_sku: true }, 
        }) as ProductIdSku[]; 
        
        const productIdMap = new Map<string, number>(products.map(p => [p.product_sku, p.product_id]));

        // --- 8. Process images in parallel (Read, Convert, Write, Upsert DB) ---
        let processedCount = 0;
        let imageProcessingErrors: string[] = [];

        const processImageItem = async (item: ImageToProcess): Promise<{ success: true } | { success: false, error: string }> => {
            const productId = productIdMap.get(item.product_sku);
            if (!productId) {
                return { success: false, error: `DB Error: Product ID not found for SKU ${item.product_sku}.` };
            }

            const sourceFilePath = path.join(sharedGraphicPath, item.product_sku, item.filename);
            const baseName = path.parse(item.filename).name;
            const webpFilename = `${baseName}.webp`;
            const destinationFolder = path.join(PRODUCT_BASE_PATH, item.product_sku);
            const destinationFilePath = path.join(destinationFolder, webpFilename);

            try {
                // a) Ensure destination folder exists (robustness check)
                await mkdir(destinationFolder, { recursive: true });

                // b) Read, Convert, and Save file (Process and Save WEBP)
                const imageBuffer = await readFile(sourceFilePath);

                await sharp(imageBuffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 100 })
                    .toFile(destinationFilePath);

                // c) Upsert data to DB: Reverting to findFirst/update/create
                const existingImage = await prismaInterlink.images_products.findFirst({
                    where: {
                        product_id: productId,
                        image_name: webpFilename,
                    },
                }) as ImageRecord | null;

                const data = {
                    product_id: productId,
                    image_name: webpFilename,
                    display_order: item.display_order,
                    visible: true,
                };

                if (existingImage) {
                    await prismaInterlink.images_products.update({
                        where: { id: existingImage.id },
                        data: data,
                    });
                } else {
                    await prismaInterlink.images_products.create({
                        data: data,
                    });
                }

                return { success: true };

            } catch (error) {
                const errorMsg = `Failed to process/save/update DB for ${item.product_sku}/${item.filename}. Error: ${(error as Error).message}`;
                return { success: false, error: errorMsg };
            }
        };

        const results = await Promise.allSettled(allImagesToProcess.map(processImageItem));

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
                processedCount++;
            } else if (result.status === 'fulfilled' && !result.value.success) {
                imageProcessingErrors.push(result.value.error);
            } else if (result.status === 'rejected') {
                imageProcessingErrors.push(`Unexpected internal failure: ${(result.reason as Error).message}`);
            }
        });

        // --- 9. Update Batch Log Status (Success/Partial Success) ---
        let finalStatus: import_product_batches_status = NEXT_STATUS;
        let finalMessage: string;
        let finalErrorDetails = folderAccessErrors.length > 0 || imageProcessingErrors.length > 0
            ? JSON.stringify({
                folder_access_issues: folderAccessErrors,
                image_processing_issues: imageProcessingErrors
            }, null, 2)
            : null;

        if (processedCount === 0 && allImagesToProcess.length > 0) {
            finalStatus = ERROR_STATUS;
            finalMessage = `CRITICAL FAILURE: No product images were successfully processed in Batch ID ${currentBatchId}. Found ${allImagesToProcess.length} images but all failed. Check error details.`;
        } else if (imageProcessingErrors.length > 0 || folderAccessErrors.length > 0) {
            finalMessage = `Partial success in Product Batch ID ${currentBatchId}. Processed ${processedCount} images successfully, but encountered ${imageProcessingErrors.length} image errors and ${folderAccessErrors.length} folder access issues. Status set to ${NEXT_STATUS} with warnings.`;
        } else {
            finalMessage = `${processedCount} product images successfully processed for Batch ID ${currentBatchId}. Status set to ${NEXT_STATUS}.`;
        }

        await prismaProductBatch.update({
            where: { id: batchLog.id },
            data: {
                status: finalStatus,
                processed_at: new Date(),
                error_details: finalErrorDetails,
            }
        });

        console.log(`Finished product image copying for Batch ID: ${currentBatchId}. Result: ${finalMessage}`);

        return {
            success: (finalStatus === NEXT_STATUS),
            batchId: currentBatchId,
            count: processedCount,
            message: finalMessage,
            error_details: finalErrorDetails,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown error during product image copying process.";
        const batchIdForError = currentBatchId || batchId || 'N/A';

        // --- 10. Update Batch Log status to ERROR if a fatal error occurred ---
        if (batchLog) {
            try {
                await prismaProductBatch.update({
                    where: { id: batchLog.id },
                    data: {
                        status: ERROR_STATUS,
                        processed_at: new Date(),
                        error_details: `Product Image copying process failed (Fatal Error): ${errorDetails}`,
                    }
                });
            } catch (logError) {
                console.error("Failed to update product batch status to ERROR after main failure:", logError);
            }
        }

        console.error(`Fatal Error in copyProductImages for Batch ID ${batchIdForError}:`, error);

        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to execute product image copying for Batch ID ${batchIdForError}.`,
            error_details: errorDetails,
        };
    }
}

// v.1.1.2 =============================================================================

// // src/services/copy-images-products.service.ts
// // 🎯 Service: Scan Product Shared Drive folders, convert to WEBP, copy, and Upsert DB
// // 💡 Logic adapted from Category Service

// import path from 'path';
// import { readFile, readdir, mkdir } from 'fs/promises';
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // Required: npm install sharp
// import { import_product_batches_status, import_product_batches, images_products } from "@prisma/generated/interlink"; 

// // === 1. INTERFACES (Required for return type) ===
// /**
//  * Interface for the result returned by the image processing service.
//  */
// export interface ImageProcessResult {
//     success: boolean;
//     batchId?: number;
//     count: number;
//     message: string;
//     error_details?: string | null;
// }

// // ===================================================================================
// // 💡 FIX: Including the getConfigSetting function here to resolve the ReferenceError.
// // In a real project, this should be imported from a central utility file (e.g., src/lib/utils.ts).
// // ===================================================================================

// /**
//  * 🎯 Helper function: Fetches Config value from config_setting table.
//  * @param key - The setting key to fetch.
//  */
// export async function getConfigSetting(key: string): Promise<string | null> {
//     try {
//         await setInterlinkSessionTZ();
//         const setting = await prismaInterlink.config_setting.findFirst({
//             where: { setting_key: key },
//             select: { setting_value: true },
//         });

//         return setting?.setting_value || null;
//     } catch (error) {
//         console.error(`Error fetching config setting '${key}':`, error);
//         return null; // Return null on DB connection error or not found
//     }
// }
// // ===================================================================================


// // 💡 Define Base Upload Path for Local Project (based on existing code)
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');

// // --- Types for internal data handling ---

// /** Defines the structure of the product SKU data parsed from the batch log. */
// interface ProductSkuDataItem {
//     product_sku: string;
// }

// /** Defines the structure for an image item collected for processing. */
// interface ImageToProcess {
//     product_sku: string;
//     filename: string;
//     display_order: number;
// }

// // Define structure for the product ID/SKU retrieved from products_clearance
// type ProductIdSku = { product_id: number; product_sku: string };

// // Define a type for the image record, assuming ID is BigInt as is common with Prisma/MySQL.
// type ImageRecord = images_products & { id: bigint };


// /**
//  * 🎯 Service: Scan Shared Drive folder, convert to WEBP, and Upsert Product Images data
//  * 💡 PENDING_STATUS: FOLDERS_CREATING
//  * 💡 NEXT_STATUS: COMPLETED
//  * @param batchId - (Optional) ID of the Batch to process. If not provided, the latest PENDING batch is used.
//  * @returns Processing result (ImageProcessResult)
//  */
// export async function copyProductImages(batchId?: number): Promise<ImageProcessResult> {
//     await setInterlinkSessionTZ();

//     let batchLog: import_product_batches | null = null;
//     let productSKUs: string[] = [];
//     let currentBatchId: number | undefined;

//     const PENDING_STATUS = import_product_batches_status.FOLDERS_CREATING;
//     const PROCESSING_STATUS = import_product_batches_status.IMAGES_COPYING;
//     const NEXT_STATUS = import_product_batches_status.COMPLETED;
//     const ERROR_STATUS = import_product_batches_status.ERROR;

//     const SHARED_CONFIG_KEY = 'products_images_path';

//     const prismaProductBatch = prismaInterlink.import_product_batches;

//     try {
//         // --- 1. Fetch Shared Path and define Local Base Path ---
//         const sharedGraphicPath = await getConfigSetting(SHARED_CONFIG_KEY); // Now getConfigSetting is defined
//         if (!sharedGraphicPath) {
//             throw new Error(`Shared graphic path is not configured (key: ${SHARED_CONFIG_KEY}). Please ensure the value is set in config_setting table.`);
//         }

//         const PRODUCT_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'products');

//         // --- 2. Find the Batch Log to process ---
//         if (batchId) {
//             batchLog = await prismaProductBatch.findUnique({
//                 where: { id: BigInt(batchId), status: PENDING_STATUS }
//             }) as import_product_batches | null;
//         } else {
//             batchLog = await prismaProductBatch.findFirst({
//                 where: { status: PENDING_STATUS },
//                 orderBy: { id: 'desc' }
//             }) as import_product_batches | null;
//         }

//         if (!batchLog) {
//             return {
//                 success: true,
//                 count: 0,
//                 message: batchId
//                     ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
//                     : `No product batches found with status ${PENDING_STATUS}.`,
//             };
//         }

//         currentBatchId = Number(batchLog.id);
//         console.log(`Starting product image copying for Batch ID: ${currentBatchId}`);

//         // --- 3. Set Batch Status to IMAGES_COPYING (Prevent re-running) ---
//         await prismaProductBatch.update({
//             where: { id: batchLog.id },
//             data: { status: PROCESSING_STATUS }
//         });

//         // --- 4. Convert JSON String to Array of Product SKUs ---
//         const jsonString = (batchLog as import_product_batches & { product_data: string }).product_data;
//         if (typeof jsonString === 'string' && jsonString.length > 0) {
//             try {
//                 const fullData = JSON.parse(jsonString) as ProductSkuDataItem[];
//                 productSKUs = fullData
//                     .map(item => item.product_sku)
//                     .filter(sku => typeof sku === 'string' && sku.trim().length > 0);
//             } catch (jsonError) {
//                 throw new Error(`Failed to parse product_data JSON for Batch ID ${currentBatchId}. Error: ${(jsonError as Error).message}`);
//             }
//         }

//         if (productSKUs.length === 0) {
//             const message = `Product data in batch log is empty or invalid JSON array for image copying in Batch ID ${currentBatchId}. Setting status to ${NEXT_STATUS}.`;
//             await prismaProductBatch.update({
//                 where: { id: batchLog.id },
//                 data: { status: NEXT_STATUS, processed_at: new Date() }
//             });
//             return { success: true, batchId: currentBatchId, count: 0, message };
//         }

//         let allImagesToProcess: ImageToProcess[] = [];
//         let folderAccessErrors: string[] = [];

//         // --- 5. Loop to Scan files in each Product folder (Shared Drive) ---
//         for (const sku of productSKUs) {
//             const sharedFolder = path.join(sharedGraphicPath, sku);

//             try {
//                 const filenames = await readdir(sharedFolder);

//                 const imageFiles = filenames
//                     .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

//                 imageFiles.forEach((filename, index) => {
//                     allImagesToProcess.push({
//                         product_sku: sku,
//                         filename: filename,
//                         display_order: index,
//                     });
//                 });

//             } catch (error) {
//                 const errorMsg = `Could not access shared folder for SKU: ${sku}. Error: ${(error as Error).message}`;
//                 console.warn(`Warning: ${errorMsg}`);
//                 folderAccessErrors.push(sku);
//             }
//         }

//         // --- 6. Check if there are images to process ---
//         if (allImagesToProcess.length === 0) {
//             const message = `Completed batch ${currentBatchId}. Found 0 images to process across ${productSKUs.length} products.`;

//             await prismaProductBatch.update({
//                 where: { id: batchLog.id },
//                 data: {
//                     status: NEXT_STATUS,
//                     processed_at: new Date(),
//                     error_details: folderAccessErrors.length > 0 ? `Folder access failures for SKUs: ${folderAccessErrors.join(', ')}` : null,
//                 }
//             });

//             return { success: true, batchId: currentBatchId, count: 0, message: message };
//         }

//         // --- 7. Fetch all relevant Product IDs (Using the correct table: products_clearance) ---
//         const skusWithImages = [...new Set(allImagesToProcess.map(i => i.product_sku))];
//         const products: ProductIdSku[] = await prismaInterlink.products_clearance.findMany({ 
//             where: { product_sku: { in: skusWithImages } },
//             select: { product_id: true, product_sku: true }, 
//         }) as ProductIdSku[]; 
        
//         const productIdMap = new Map<string, number>(products.map(p => [p.product_sku, p.product_id]));

//         // --- 8. Process images in parallel (Read, Convert, Write, Upsert DB) ---
//         let processedCount = 0;
//         let imageProcessingErrors: string[] = [];

//         const processImageItem = async (item: ImageToProcess): Promise<{ success: true } | { success: false, error: string }> => {
//             const productId = productIdMap.get(item.product_sku);
//             if (!productId) {
//                 return { success: false, error: `DB Error: Product ID not found for SKU ${item.product_sku}.` };
//             }

//             const sourceFilePath = path.join(sharedGraphicPath, item.product_sku, item.filename);
//             const baseName = path.parse(item.filename).name;
//             const webpFilename = `${baseName}.webp`;
//             const destinationFolder = path.join(PRODUCT_BASE_PATH, item.product_sku);
//             const destinationFilePath = path.join(destinationFolder, webpFilename);

//             try {
//                 // a) Ensure destination folder exists (robustness check)
//                 await mkdir(destinationFolder, { recursive: true });

//                 // b) Read, Convert, and Save file (Process and Save WEBP)
//                 const imageBuffer = await readFile(sourceFilePath);

//                 await sharp(imageBuffer)
//                     .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
//                     .webp({ quality: 100 })
//                     .toFile(destinationFilePath);

//                 // c) Upsert data to DB: Reverting to findFirst/update/create
//                 const existingImage = await prismaInterlink.images_products.findFirst({
//                     where: {
//                         product_id: productId,
//                         image_name: webpFilename,
//                     },
//                 }) as ImageRecord | null;

//                 const data = {
//                     product_id: productId,
//                     image_name: webpFilename,
//                     display_order: item.display_order,
//                     visible: true,
//                 };

//                 if (existingImage) {
//                     await prismaInterlink.images_products.update({
//                         where: { id: existingImage.id },
//                         data: data,
//                     });
//                 } else {
//                     await prismaInterlink.images_products.create({
//                         data: data,
//                     });
//                 }

//                 return { success: true };

//             } catch (error) {
//                 const errorMsg = `Failed to process/save/update DB for ${item.product_sku}/${item.filename}. Error: ${(error as Error).message}`;
//                 return { success: false, error: errorMsg };
//             }
//         };

//         const results = await Promise.allSettled(allImagesToProcess.map(processImageItem));

//         results.forEach(result => {
//             if (result.status === 'fulfilled' && result.value.success) {
//                 processedCount++;
//             } else if (result.status === 'fulfilled' && !result.value.success) {
//                 imageProcessingErrors.push(result.value.error);
//             } else if (result.status === 'rejected') {
//                 imageProcessingErrors.push(`Unexpected internal failure: ${(result.reason as Error).message}`);
//             }
//         });

//         // --- 9. Update Batch Log Status (Success/Partial Success) ---
//         let finalStatus: import_product_batches_status = NEXT_STATUS;
//         let finalMessage: string;
//         let finalErrorDetails = folderAccessErrors.length > 0 || imageProcessingErrors.length > 0
//             ? JSON.stringify({
//                 folder_access_issues: folderAccessErrors,
//                 image_processing_issues: imageProcessingErrors
//             }, null, 2)
//             : null;

//         if (processedCount === 0 && allImagesToProcess.length > 0) {
//             finalStatus = ERROR_STATUS;
//             finalMessage = `CRITICAL FAILURE: No product images were successfully processed in Batch ID ${currentBatchId}. Found ${allImagesToProcess.length} images but all failed. Check error details.`;
//         } else if (imageProcessingErrors.length > 0 || folderAccessErrors.length > 0) {
//             finalMessage = `Partial success in Product Batch ID ${currentBatchId}. Processed ${processedCount} images successfully, but encountered ${imageProcessingErrors.length} image errors and ${folderAccessErrors.length} folder access issues. Status set to ${NEXT_STATUS} with warnings.`;
//         } else {
//             finalMessage = `${processedCount} product images successfully processed for Batch ID ${currentBatchId}. Status set to ${NEXT_STATUS}.`;
//         }

//         await prismaProductBatch.update({
//             where: { id: batchLog.id },
//             data: {
//                 status: finalStatus,
//                 processed_at: new Date(),
//                 error_details: finalErrorDetails,
//             }
//         });

//         console.log(`Finished product image copying for Batch ID: ${currentBatchId}. Result: ${finalMessage}`);

//         return {
//             success: (finalStatus === NEXT_STATUS),
//             batchId: currentBatchId,
//             count: processedCount,
//             message: finalMessage,
//             error_details: finalErrorDetails,
//         };

//     } catch (error) {
//         const errorDetails = error instanceof Error ? error.message : "Unknown error during product image copying process.";
//         const batchIdForError = currentBatchId || batchId || 'N/A';

//         // --- 10. Update Batch Log status to ERROR if a fatal error occurred ---
//         if (batchLog) {
//             try {
//                 await prismaProductBatch.update({
//                     where: { id: batchLog.id },
//                     data: {
//                         status: ERROR_STATUS,
//                         processed_at: new Date(),
//                         error_details: `Product Image copying process failed (Fatal Error): ${errorDetails}`,
//                     }
//                 });
//             } catch (logError) {
//                 console.error("Failed to update product batch status to ERROR after main failure:", logError);
//             }
//         }

//         console.error(`Fatal Error in copyProductImages for Batch ID ${batchIdForError}:`, error);

//         return {
//             success: false,
//             batchId: currentBatchId,
//             count: 0,
//             message: `Failed to execute product image copying for Batch ID ${batchIdForError}.`,
//             error_details: errorDetails,
//         };
//     }
// }