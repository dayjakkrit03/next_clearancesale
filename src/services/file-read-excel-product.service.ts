// v.1.1.3 ============================================================
// src/services/file-read-excel-product.service.ts

import path from 'path';
import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import * as xlsx from 'xlsx';
// 💡 Import Enum และ Type จาก Prisma สำหรับ Batch Log ของ Product
import { import_product_batches_status } from "@prisma/generated/interlink"; 
import { import_product_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// =================================================================
// 1. INTERFACES AND TYPES (รองรับทุกคอลัมน์)
// =================================================================

// 💡 โครงสร้างข้อมูล Product ที่คาดว่าจะได้รับจาก Excel 
export type ProductImportItem = Record<string, any>; 

// 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
export interface BatchLogResult {
    batchId: bigint;
    totalRecords: number;
    sourceFilename: string;
}

// กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราวสำหรับ Product Import
const LOCAL_TEMP_EXCEL_PRODUCT_PATH = path.join(process.cwd(), 'public/temp/excel_product_import');

// =================================================================
// 2. HELPER FUNCTIONS (REUSED/ADAPTED)
// =================================================================

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
        return null;
    }
}


/**
 * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Product ล่าสุดใน Shared Drive Path
 * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
 * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
 */
async function findLatestProductExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
    try {
        const filenames = await readdir(excelPath);
        
        // กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ products_clearance_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
        const productFiles = filenames.filter(name => /^products_clearance_\d{8}\.xlsx$/i.test(name));
        
        if (productFiles.length === 0) {
            return null;
        }

        let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

        // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
        for (const filename of productFiles) {
            const filePath = path.join(excelPath, filename);
            try {
                const fileStat = await lstat(filePath);

                if (!fileStat.isFile()) continue;

                const mtime = fileStat.mtime;

                // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
                if (!latestFile || mtime > latestFile.mtime) {
                    latestFile = { filePath, filename, mtime };
                }
            } catch (err) {
                console.warn(`[Product Service] Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
            }
        }

        if (!latestFile) {
            return null;
        }

        return { filePath: latestFile.filePath, filename: latestFile.filename };

    } catch (error) {
        console.error(`[Product Service] Error reading Excel directory ${excelPath} from Shared Drive:`, error);
        throw new Error(`Failed to access Shared Excel path for products: ${excelPath}. Error: ${(error as Error).message}`);
    }
}

/**
 * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File (ดึงทุกคอลัมน์โดยใช้ Header ในไฟล์)
 * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
 * @returns Array ของ ProductImportItem ที่มีทุกคอลัมน์
 */
async function readProductExcelFile(filePath: string): Promise<ProductImportItem[]> {
    console.log(`[Product Service] Reading and parsing ALL columns from Product Excel file: ${filePath}`);
    
    try {
        const fileBuffer = await readFile(filePath);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // 💡 FIX: ใช้ header: 1 เพื่อให้ได้ Array of Array (Matrix) เพื่อดึง Header ที่ถูกต้องด้วยตนเอง
        const dataMatrix = xlsx.utils.sheet_to_json<any[]>(sheet, {
            header: 1, 
            defval: null, 
        });
        
        if (dataMatrix.length === 0) {
             // กรณีที่ไม่มีข้อมูลเลย
             return [];
        }

        // 1. ดึง Header จากแถวแรก และทำ Normalization
        // Header จะถูกเก็บเป็น String (เช่น "product_id", "9", "product name")
        const rawHeaders = dataMatrix[0] as (string | number | null)[];
        
        // 🚨 FIX 1: ป้องกัน undefined/null ใน rawHeaders ก่อนเรียก String()
        const headers: string[] = rawHeaders.map(h => {
            // ใช้ Nullish Coalescing (?? '') เพื่อให้เป็น String ว่าง ถ้าเป็น null/undefined
            const headerString = (h ?? '').toString(); 
            return headerString.trim().toLowerCase();
        });
        
        // 2. ประมวลผล Data Rows (เริ่มจาก Index 1)
        const rawDataRows = dataMatrix.slice(1);
        
        const normalizedJson: ProductImportItem[] = [];

        rawDataRows.forEach(row => {
            const newRow: ProductImportItem = {};
            let isRowEmpty = true;
            
            // วนลูปตามจำนวน Header
            headers.forEach((normalizedKey, index) => {
                let value = row[index]; // ดึงค่าตาม Index ของคอลัมน์

                // --- Cleanup Value ---
                // 🚨 FIX 2: ป้องกัน undefined/null ก่อนเรียก typeof/trim/toUpperCase
                if (value !== null && value !== undefined) {
                    if (typeof value === 'string') {
                        // เนื่องจากเรามั่นใจแล้วว่า value ไม่ใช่ null/undefined และเป็น string
                        value = value.trim();
                        
                        // 💡 โค้ดที่ก่อปัญหาอยู่ตรงนี้: value.toUpperCase()
                        // ตอนนี้ปลอดภัยแล้วเพราะเราเช็ค value !== null && value !== undefined 
                        // และ typeof value === 'string' แล้ว
                        if (value.toUpperCase() === 'NULL' || value === '') {
                            value = null; // แปลง 'NULL' หรือ Empty String ให้เป็น null
                        }
                    }
                } else {
                    // ถ้าค่าที่อ่านมาเป็น undefined หรือ null ให้ตั้งค่าเป็น null ไปเลย
                    value = null;
                }
                
                // แปลงค่า True/False (1/0) เป็น Boolean สำหรับคอลัมน์ 'visible' ถ้ามี
                if (normalizedKey === 'visible') {
                    if (value === 1 || value === '1' || value === true) {
                         value = true;
                    } else if (value === 0 || value === '0' || value === false) {
                         value = false;
                    }
                }
                
                // ใช้ normalizedKey ที่มาจาก Header แถวแรกเป็น Key
                newRow[normalizedKey] = value;
                
                // ตรวจสอบว่าแถวนี้ไม่ว่างเปล่า
                // ใช้แค่ value !== null ก็เพียงพอแล้ว เพราะค่า undefined ถูกแปลงเป็น null แล้ว
                if (value !== null) {
                    isRowEmpty = false;
                }
            });

            // 3. Filter: เพิ่มเฉพาะแถวที่มีข้อมูลอย่างน้อยหนึ่งคอลัมน์ที่ไม่ใช่ null
            if (!isRowEmpty) {
                normalizedJson.push(newRow);
            }
        });


        // 4. Return ข้อมูลที่ถูกต้อง
        return normalizedJson;

    } catch (error) {
        console.error(`[Product Service] Error reading or parsing Product Excel file ${filePath}:`, error);
        throw new Error(`Failed to read or parse Product Excel file: ${path.basename(filePath)}. Error: ${(error as Error).message}`);
    }
}

/**
 * 🎯 บันทึกข้อมูล Product ที่อ่านได้จาก Excel ลงในตาราง Staging (import_product_batches)
 * @param dataList - Array ของข้อมูล Product ที่อ่านได้จาก Excel
 * @param filename - ชื่อไฟล์ Excel ต้นทาง
 */
export async function saveProductBatchLog(
    dataList: ProductImportItem[],
    filename: string
): Promise<BatchLogResult> {
    await setInterlinkSessionTZ();
    
    // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ product_data
    const productJson = JSON.stringify(dataList);

    // 🚨 ปรับ: ใช้ตาราง import_product_batches
    const result = await prismaInterlink.import_product_batches.create({
        data: {
            product_data: productJson, // 🚨 ปรับ: ใช้คอลัมน์ product_data
            source_filename: filename,
            total_records: dataList.length,
            status: import_product_batches_status.PENDING, // 🚨 ใช้ Enum PENDING
            // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
        },
    });

    return {
        batchId: result.id,
        totalRecords: result.total_records,
        sourceFilename: result.source_filename ?? filename,
    };
}


// =================================================================
// 3. MAIN SERVICE CLASS
// =================================================================

export class FileReadExcelProductService {

    /**
     * 🎯 ฟังก์ชันหลัก: ค้นหาไฟล์, คัดลอก, อ่าน, และบันทึก Batch Log สำหรับ Product
     */
    public async readExcelAndSaveBatch(): Promise<BatchLogResult> {
        
        // 1. ดึง Path จาก config_setting
        const excelPath = await getConfigSetting('excel_products_path'); // UNC Path

        if (!excelPath) {
            throw new Error('Excel product path is not configured in config_setting table (key: excel_products_path).');
        }
        
        // 2. ค้นหาไฟล์ Excel Product ล่าสุด (จาก UNC Path)
        const latestFile = await findLatestProductExcelFile(excelPath);

        if (!latestFile) {
            throw new Error(`No Excel files matching 'products_clearance_YYYYMMDD.xlsx' found in path: ${excelPath}`);
        }
        
        // 💡 ตรวจสอบการนำเข้าไฟล์ซ้ำ
        const sourceFilename = latestFile.filename;
        console.log(`[Product Service] Checking for duplicate filename in import_product_batches: ${sourceFilename}`);
        
        const duplicateCount = await prismaInterlink.import_product_batches.count({
            where: { source_filename: sourceFilename },
        });

        if (duplicateCount > 0) {
            throw new Error(`File already imported or pending. Source filename '${sourceFilename}' found in batch log.`);
        }
        console.log(`[Product Service] Filename check successful. Continuing with file copy.`);
        
        // 3. สร้างโฟลเดอร์ Local Temp สำหรับ Product และ Copy ไฟล์
        await mkdir(LOCAL_TEMP_EXCEL_PRODUCT_PATH, { recursive: true });
        
        const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PRODUCT_PATH, latestFile.filename);
        
        console.log(`[Product Service] Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
        
        try {
            await copyFile(latestFile.filePath, localDestinationFilePath);
            console.log(`[Product Service] Successfully copied file: ${latestFile.filename}`);
        } catch (copyError) {
            console.error(`[Product Service] Error copying Excel file from Shared Drive:`, copyError);
            throw new Error(`Failed to copy Product Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
        }

        // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
        const productData = await readProductExcelFile(localDestinationFilePath);
        
        if (productData.length === 0) {
            throw new Error(`Excel file ${latestFile.filename} was read but contains no valid product data. (It may be empty or header/data format is incorrect)`);
        }
        
        // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
        const batchResult = await saveProductBatchLog(productData, latestFile.filename);

        return batchResult;
    }
}
// v.1.1.3 ============================================================

// v.1.1.2 ============================================================
// // src/services/file-read-excel-product.service.ts

// import path from 'path';
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import * as xlsx from 'xlsx';
// // 💡 Import Enum และ Type จาก Prisma สำหรับ Batch Log ของ Product
// import { import_product_batches_status } from "@prisma/generated/interlink"; 
// import { import_product_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// // =================================================================
// // 1. INTERFACES AND TYPES (รองรับทุกคอลัมน์)
// // =================================================================

// // 💡 โครงสร้างข้อมูล Product ที่คาดว่าจะได้รับจาก Excel 
// export type ProductImportItem = Record<string, any>; 

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราวสำหรับ Product Import
// const LOCAL_TEMP_EXCEL_PRODUCT_PATH = path.join(process.cwd(), 'public/temp/excel_product_import');

// // =================================================================
// // 2. HELPER FUNCTIONS (REUSED/ADAPTED)
// // =================================================================

// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
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
//         return null;
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Product ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestProductExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         const filenames = await readdir(excelPath);
        
//         // กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ products_clearance_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const productFiles = filenames.filter(name => /^products_clearance_\d{8}\.xlsx$/i.test(name));
        
//         if (productFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of productFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 const fileStat = await lstat(filePath);

//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`[Product Service] Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`[Product Service] Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         throw new Error(`Failed to access Shared Excel path for products: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }

// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File (ดึงทุกคอลัมน์โดยใช้ Header ในไฟล์)
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ ProductImportItem ที่มีทุกคอลัมน์
//  */
// async function readProductExcelFile(filePath: string): Promise<ProductImportItem[]> {
//     console.log(`[Product Service] Reading and parsing ALL columns from Product Excel file: ${filePath}`);
    
//     try {
//         const fileBuffer = await readFile(filePath);
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // 💡 FIX: ใช้ header: 1 เพื่อให้ได้ Array of Array (Matrix) เพื่อดึง Header ที่ถูกต้องด้วยตนเอง
//         const dataMatrix = xlsx.utils.sheet_to_json<any[]>(sheet, {
//             header: 1, 
//             defval: null, 
//         });
        
//         if (dataMatrix.length === 0) {
//              // กรณีที่ไม่มีข้อมูลเลย
//              return [];
//         }

//         // 1. ดึง Header จากแถวแรก และทำ Normalization
//         // Header จะถูกเก็บเป็น String (เช่น "product_id", "9", "product name")
//         const rawHeaders = dataMatrix[0] as (string | number | null)[];
        
//         // 🚨 CRITICAL FIX: แปลง Header ให้เป็น string, trim, และ lowerCase เพื่อใช้เป็น Key มาตรฐาน
//         const headers: string[] = rawHeaders.map(h => {
//             let headerString = (h === null || h === undefined) ? '' : String(h);
//             return headerString.trim().toLowerCase();
//         });
        
//         // 2. ประมวลผล Data Rows (เริ่มจาก Index 1)
//         const rawDataRows = dataMatrix.slice(1);
        
//         const normalizedJson: ProductImportItem[] = [];

//         rawDataRows.forEach(row => {
//             const newRow: ProductImportItem = {};
//             let isRowEmpty = true;
            
//             // วนลูปตามจำนวน Header
//             headers.forEach((normalizedKey, index) => {
//                 let value = row[index]; // ดึงค่าตาม Index ของคอลัมน์

//                 // --- Cleanup Value ---
//                 if (typeof value === 'string') {
//                     value = value.trim();
//                     if (value.toUpperCase() === 'NULL' || value === '') {
//                         value = null; // แปลง 'NULL' หรือ Empty String ให้เป็น null
//                     }
//                 }
                
//                 // แปลงค่า True/False (1/0) เป็น Boolean สำหรับคอลัมน์ 'visible' ถ้ามี
//                 if (normalizedKey === 'visible') {
//                     if (value === 1 || value === '1' || value === true) {
//                          value = true;
//                     } else if (value === 0 || value === '0' || value === false) {
//                          value = false;
//                     }
//                 }
                
//                 // ใช้ normalizedKey ที่มาจาก Header แถวแรกเป็น Key
//                 newRow[normalizedKey] = value;
                
//                 // ตรวจสอบว่าแถวนี้ไม่ว่างเปล่า
//                 if (value !== null) {
//                     isRowEmpty = false;
//                 }
//             });

//             // 3. Filter: เพิ่มเฉพาะแถวที่มีข้อมูลอย่างน้อยหนึ่งคอลัมน์ที่ไม่ใช่ null
//             if (!isRowEmpty) {
//                 normalizedJson.push(newRow);
//             }
//         });


//         // 4. Return ข้อมูลที่ถูกต้อง
//         return normalizedJson;

//     } catch (error) {
//         console.error(`[Product Service] Error reading or parsing Product Excel file ${filePath}:`, error);
//         throw new Error(`Failed to read or parse Product Excel file: ${path.basename(filePath)}. Error: ${(error as Error).message}`);
//     }
// }

// /**
//  * 🎯 บันทึกข้อมูล Product ที่อ่านได้จาก Excel ลงในตาราง Staging (import_product_batches)
//  * @param dataList - Array ของข้อมูล Product ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveProductBatchLog(
//     dataList: ProductImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
    
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ product_data
//     const productJson = JSON.stringify(dataList);

//     // 🚨 ปรับ: ใช้ตาราง import_product_batches
//     const result = await prismaInterlink.import_product_batches.create({
//         data: {
//             product_data: productJson, // 🚨 ปรับ: ใช้คอลัมน์ product_data
//             source_filename: filename,
//             total_records: dataList.length,
//             status: import_product_batches_status.PENDING, // 🚨 ใช้ Enum PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }


// // =================================================================
// // 3. MAIN SERVICE CLASS
// // =================================================================

// export class FileReadExcelProductService {

//     /**
//      * 🎯 ฟังก์ชันหลัก: ค้นหาไฟล์, คัดลอก, อ่าน, และบันทึก Batch Log สำหรับ Product
//      */
//     public async readExcelAndSaveBatch(): Promise<BatchLogResult> {
        
//         // 1. ดึง Path จาก config_setting
//         const excelPath = await getConfigSetting('excel_products_path'); // UNC Path

//         if (!excelPath) {
//             throw new Error('Excel product path is not configured in config_setting table (key: excel_products_path).');
//         }
        
//         // 2. ค้นหาไฟล์ Excel Product ล่าสุด (จาก UNC Path)
//         const latestFile = await findLatestProductExcelFile(excelPath);

//         if (!latestFile) {
//             throw new Error(`No Excel files matching 'products_clearance_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//         }
        
//         // 💡 ตรวจสอบการนำเข้าไฟล์ซ้ำ
//         const sourceFilename = latestFile.filename;
//         console.log(`[Product Service] Checking for duplicate filename in import_product_batches: ${sourceFilename}`);
        
//         const duplicateCount = await prismaInterlink.import_product_batches.count({
//             where: { source_filename: sourceFilename },
//         });

//         if (duplicateCount > 0) {
//             throw new Error(`File already imported or pending. Source filename '${sourceFilename}' found in batch log.`);
//         }
//         console.log(`[Product Service] Filename check successful. Continuing with file copy.`);
        
//         // 3. สร้างโฟลเดอร์ Local Temp สำหรับ Product และ Copy ไฟล์
//         await mkdir(LOCAL_TEMP_EXCEL_PRODUCT_PATH, { recursive: true });
        
//         const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PRODUCT_PATH, latestFile.filename);
        
//         console.log(`[Product Service] Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
        
//         try {
//             await copyFile(latestFile.filePath, localDestinationFilePath);
//             console.log(`[Product Service] Successfully copied file: ${latestFile.filename}`);
//         } catch (copyError) {
//             console.error(`[Product Service] Error copying Excel file from Shared Drive:`, copyError);
//             throw new Error(`Failed to copy Product Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//         }

//         // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//         const productData = await readProductExcelFile(localDestinationFilePath);
        
//         if (productData.length === 0) {
//             throw new Error(`Excel file ${latestFile.filename} was read but contains no valid product data. (It may be empty or header/data format is incorrect)`);
//         }
        
//         // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//         const batchResult = await saveProductBatchLog(productData, latestFile.filename);

//         return batchResult;
//     }
// }
// v.1.1.2 ============================================================

// // src/services/file-read-excel-product.service.ts

// import path from 'path';
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import * as xlsx from 'xlsx';
// // 💡 Import Enum และ Type จาก Prisma สำหรับ Batch Log ของ Product
// import { import_product_batches_status } from "@prisma/generated/interlink"; 
// // import { import_product_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// // =================================================================
// // 1. INTERFACES AND TYPES
// // =================================================================

// // 💡 โครงสร้างข้อมูล Product ที่คาดว่าจะได้รับจาก Excel (ตัวอย่าง)
// export interface ProductImportItem {
//     product_code: string;
//     product_name: string;
//     price: number;
//     stock: number;
//     category_slug: string; // คอลัมน์ที่เชื่อมโยงกับ Category
//     image_filename: string | null;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราวสำหรับ Product Import
// const LOCAL_TEMP_EXCEL_PRODUCT_PATH = path.join(process.cwd(), 'public/temp/excel_product_import');

// // =================================================================
// // 2. HELPER FUNCTIONS (REUSED/ADAPTED)
// // =================================================================

// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * (คัดลอกมาจาก file.service.ts)
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
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
//         return null;
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Product ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestProductExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         const filenames = await readdir(excelPath);
        
//         // 🚨 ปรับ: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ products_clearance_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const productFiles = filenames.filter(name => /^products_clearance_\d{8}\.xlsx$/i.test(name));
        
//         if (productFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of productFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 const fileStat = await lstat(filePath);

//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`[Product Service] Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`[Product Service] Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         throw new Error(`Failed to access Shared Excel path for products: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }

// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ ProductImportItem
//  */
// async function readProductExcelFile(filePath: string): Promise<ProductImportItem[]> {
//     console.log(`[Product Service] Reading and parsing Product Excel file from local path: ${filePath}`);
    
//     try {
//         const fileBuffer = await readFile(filePath);
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // 🚨 ปรับ: กำหนด Header ให้ตรงกับโครงสร้างข้อมูล Product ที่คาดหวัง
//         // สมมติ Header: A=product_code, B=product_name, C=price, D=stock, E=category_slug, F=image_filename
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['product_code', 'product_name', 'price', 'stock', 'category_slug', 'image_filename'], 
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
        
//         // กรองแถวที่ 'product_code' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             .filter(row => row.product_code !== null && row.product_code !== undefined) // กรองแถวที่ไม่มี product_code
//             .map((row, index) => {
                
//                 // ตรวจสอบและแปลงค่า Price/Stock
//                 let priceValue = parseFloat(row.price) || 0;
//                 let stockValue = parseInt(row.stock) || 0;
                
//                 if (isNaN(priceValue) || isNaN(stockValue)) {
//                     console.warn(`[Product Service] Warning: Invalid Price or Stock value found at row ${index + 2}. Using 0 as fallback.`);
//                 }

//                 // 🚨 NOTE: ในการใช้งานจริง ควรมีการ Validate ข้อมูลที่ซับซ้อนกว่านี้
                
//                 return { 
//                     product_code: String(row.product_code).trim(),
//                     product_name: String(row.product_name).trim(),
//                     price: priceValue, 
//                     stock: stockValue, 
//                     category_slug: String(row.category_slug).toLowerCase().trim(),
//                     image_filename: row.image_filename ? String(row.image_filename).trim() : null,
//                 };
//             });

//     } catch (error) {
//         console.error(`[Product Service] Error reading or parsing Product Excel file ${filePath}:`, error);
//         throw new Error(`Failed to read or parse Product Excel file: ${path.basename(filePath)}. Error: ${(error as Error).message}`);
//     }
// }

// /**
//  * 🎯 บันทึกข้อมูล Product ที่อ่านได้จาก Excel ลงในตาราง Staging (import_product_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Product ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveProductBatchLog(
//     dataList: ProductImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
    
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const productJson = JSON.stringify(dataList);

//     // 🚨 ปรับ: ใช้ตาราง import_product_batches
//     const result = await prismaInterlink.import_product_batches.create({
//         data: {
//             product_data: productJson, // 🚨 ปรับ: ใช้คอลัมน์ product_data
//             source_filename: filename,
//             total_records: dataList.length,
//             status: import_product_batches_status.PENDING, // 🚨 ปรับ: ใช้ Enum PENDING ของ Product
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }


// // =================================================================
// // 3. MAIN SERVICE CLASS
// // =================================================================

// export class FileReadExcelProductService {

//     /**
//      * 🎯 ฟังก์ชันหลัก: ค้นหาไฟล์, คัดลอก, อ่าน, และบันทึก Batch Log สำหรับ Product
//      * (Logic คล้ายกับ readExcelAndSaveBatch เดิม แต่ใช้ Product Path/Table)
//      */
//     public async readExcelAndSaveBatch(): Promise<BatchLogResult> {
        
//         // 1. ดึง Path จาก config_setting (คีย์ใหม่: excel_products_path)
//         const excelPath = await getConfigSetting('excel_products_path'); // นี่คือ UNC Path

//         if (!excelPath) {
//             throw new Error('Excel product path is not configured in config_setting table (key: excel_products_path).');
//         }
        
//         // 2. ค้นหาไฟล์ Excel Product ล่าสุด (จาก UNC Path)
//         const latestFile = await findLatestProductExcelFile(excelPath);

//         if (!latestFile) {
//             throw new Error(`No Excel files matching 'products_clearance_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//         }
        
//         // 💡 ขั้นตอนใหม่: ตรวจสอบการนำเข้าไฟล์ซ้ำใน Database ก่อนดำเนินการต่อ
//         const sourceFilename = latestFile.filename;
//         console.log(`[Product Service] Checking for duplicate filename in import_product_batches: ${sourceFilename}`);
        
//         // 🚨 ปรับ: ใช้ตาราง import_product_batches สำหรับตรวจสอบ
//         const duplicateCount = await prismaInterlink.import_product_batches.count({
//             where: {
//                 source_filename: sourceFilename,
//                 // อาจจะต้องกรองสถานะที่ไม่ใช่ COMPLETED/FAILED ด้วย ถ้ามี Logic นั้น
//             },
//         });

//         if (duplicateCount > 0) {
//             // พบไฟล์ซ้ำ: โยน Error เพื่อให้ API Route ดักจับ
//             throw new Error(`File already imported or pending. Source filename '${sourceFilename}' found in batch log.`);
//         }
//         console.log(`[Product Service] Filename check successful. Continuing with file copy.`);
        
//         // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp สำหรับ Product และ Copy ไฟล์
//         // 🚨 ปรับ: ใช้ Path ที่กำหนดสำหรับ Product โดยเฉพาะ
//         await mkdir(LOCAL_TEMP_EXCEL_PRODUCT_PATH, { recursive: true });
        
//         const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PRODUCT_PATH, latestFile.filename);
        
//         console.log(`[Product Service] Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
        
//         try {
//             // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//             await copyFile(latestFile.filePath, localDestinationFilePath);
//             console.log(`[Product Service] Successfully copied file: ${latestFile.filename}`);
//         } catch (copyError) {
//             console.error(`[Product Service] Error copying Excel file from Shared Drive:`, copyError);
//             throw new Error(`Failed to copy Product Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//         }

//         // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//         const productData = await readProductExcelFile(localDestinationFilePath);
        
//         if (productData.length === 0) {
//             throw new Error(`Excel file ${latestFile.filename} was read but contains no valid product data. (It may be empty or header/data format is incorrect)`);
//         }
        
//         // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//         const batchResult = await saveProductBatchLog(productData, latestFile.filename);

//         return batchResult;
//     }
// }