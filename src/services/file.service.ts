// v.1.1.9 ===================================================================
// src/services/file.service.ts

import path from 'path';
// 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx
// 💡 NEW: Import Enum และ Type จาก Prisma สำหรับ Batch Log
import { import_category_batches_status } from "@prisma/generated/interlink"; 
import { import_category_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
export interface CategoryImportItem {
    slug: string;
    name: string;
    display_order: number;
    visible: boolean;
}

// 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
export interface BatchLogResult {
    batchId: bigint;
    totalRecords: number;
    sourceFilename: string;
}

// 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders (เดิม)
export interface FolderCreationRequest {
    items: FolderCreationItem[]; // Array ของ Category slug
}

// กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
export interface FolderCreationItem {
    // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
    slug: string;
}

// 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images (ถูกทิ้งแล้ว แต่คงไว้เพื่ออ้างอิง)
export interface ImageProcessItem {
    slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
}

export interface ImageProcessRequest {
    items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
}

// 💡 NEW: กำหนด Type สำหรับ Return Value ของ Folder Creation Service
export interface FolderProcessResult {
    success: boolean;
    batchId?: number;
    count: number; // จำนวนโฟลเดอร์ที่พยายามสร้าง
    message: string;
    error_details?: string;
}

// 💡 NEW: กำหนด Type สำหรับ Return Value ของ Image Copy Service
export interface ImageProcessResult {
    success: boolean;
    batchId?: number;
    count: number; // จำนวนรูปภาพที่ประมวลผลสำเร็จ
    message: string;
    error_details?: string | null;
}

// กำหนด Base Upload Path สำหรับ Local Project
const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

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


// === 2. BATCH LOG SERVICE FUNCTIONS ===

/**
 * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
 * พร้อมตั้งสถานะเป็น PENDING
 * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
 * @param filename - ชื่อไฟล์ Excel ต้นทาง
 */
export async function saveCategoryBatchLog(
    dataList: CategoryImportItem[],
    filename: string
): Promise<BatchLogResult> {
    await setInterlinkSessionTZ();
    
    // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
    const categoryJson = JSON.stringify(dataList);

    const result = await prismaInterlink.import_category_batches.create({
        data: {
            category_data: categoryJson,
            source_filename: filename,
            total_records: dataList.length,
            status: import_category_batches_status.PENDING, // 💡 ใช้ Enum PENDING
            // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
        },
    });

    return {
        batchId: result.id,
        totalRecords: result.total_records,
        sourceFilename: result.source_filename ?? filename,
    };
}

// === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

/**
 * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
 * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
 * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
 */
async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
    try {
        // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
        const filenames = await readdir(excelPath);
        
        // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
        const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
        
        if (categoryFiles.length === 0) {
            return null;
        }

        let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

        // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
        for (const filename of categoryFiles) {
            const filePath = path.join(excelPath, filename);
            try {
                // NOTE: ยังคงต้องใช้ lstat บน Network Path
                const fileStat = await lstat(filePath);

                // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
                if (!fileStat.isFile()) continue;

                const mtime = fileStat.mtime;

                // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
                if (!latestFile || mtime > latestFile.mtime) {
                    latestFile = { filePath, filename, mtime };
                }
            } catch (err) {
                console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
                // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
            }
        }

        if (!latestFile) {
            return null;
        }

        return { filePath: latestFile.filePath, filename: latestFile.filename };

    } catch (error) {
        console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
        // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
        throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
    }
}


/**
 * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
 * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
 * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
 * @returns Array ของ CategoryImportItem
 */
async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
    console.log(`Reading and parsing Excel file from local path: ${filePath}`);
    
    try {
        // 1. อ่านไฟล์เป็น Buffer ด้วย fs/promises (เพื่อตรวจสอบการเข้าถึงไฟล์)
        const fileBuffer = await readFile(filePath);

        // 2. ใช้ xlsx.read จาก Buffer แทนการใช้ xlsx.readFile ตรงๆ
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
        // NOTE: xlsx.utils.sheet_to_json จะอ่านค่าจากคอลัมน์ตามลำดับที่กำหนดใน Array Header
        // 🚨 FIX: เพิ่ม 'image_filename' เพื่อให้ตรงกับโครงสร้าง 5 คอลัมน์ (A, B, C, D, E)
        const json = xlsx.utils.sheet_to_json<any>(sheet, {
            header: ['slug', 'name', 'image_filename', 'display_order', 'visible'], 
            range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
            defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
        });
        
        // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
        return json
            // เนื่องจากเราไม่ใช้ 'image_filename' ใน CategoryImportItem เราจึงกรองมันทิ้งไป
            // แต่เราต้อง filter row ที่ slug หรือ name ว่างออกไปก่อน
            .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
            .map((row, index) => {
                
                // 1. ตรวจสอบ display_order และใช้ index เป็น Fallback
                // ค่า display_order จะถูกอ่านจากคอลัมน์ D แล้วตอนนี้
                let orderValue = parseInt(row.display_order);
                if (isNaN(orderValue)) {
                    orderValue = index; // ใช้ index เป็นค่าเริ่มต้นที่ปลอดภัย
                    console.warn(`Warning: Invalid display_order value ('${row.display_order}') found at row ${index + 2}. Using index ${index} as fallback.`);
                }

                // 2. ตรวจสอบ visible (Excel มักจะเก็บ 1/0 หรือ true/false)
                // ค่า visible จะถูกอ่านจากคอลัมน์ E แล้วตอนนี้
                let isVisible = true;
                if (row.visible !== null && row.visible !== undefined) {
                    // แปลงค่าจาก Excel (1/0 หรือ 'TRUE'/'FALSE') ให้เป็น Boolean
                    const rowVisible = String(row.visible).toLowerCase();
                    if (rowVisible === '0' || rowVisible === 'false') {
                        isVisible = false;
                    } else if (rowVisible === '1' || rowVisible === 'true') {
                        isVisible = true;
                    }
                }
                
                return { 
                    // Clean และ Validate ข้อมูล
                    slug: String(row.slug).toLowerCase().trim(),
                    name: String(row.name).trim(),
                    
                    // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา display_order)
                    display_order: orderValue, 
                    
                    // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา visible Hardcode)
                    visible: isVisible, 
                };
            });

    } catch (error) {
        console.error(`Error reading or parsing Excel file ${filePath}:`, error);
        // 🚨 อัปเดต Error Message ให้สะท้อนปัญหา
        throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: Cannot access file. (Reason: ${(error as Error).message})`);
    }
}


/**
 * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
 * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
 */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
//     
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
//     
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
//     
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
//     
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
//     
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
//     
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
//     }
//     
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }

export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
    // 1. ดึง Path จาก config_setting
    const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

    if (!excelPath) {
        throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
    }
    
    // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
    const latestFile = await findLatestCategoryExcelFile(excelPath);

    if (!latestFile) {
        throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
    }
    
    // 💡 ขั้นตอนใหม่: ตรวจสอบการนำเข้าไฟล์ซ้ำใน Database ก่อนดำเนินการต่อ (แทรกตรงนี้)
    const sourceFilename = latestFile.filename;
    console.log(`[File Service] Checking for duplicate filename in import_category_batches: ${sourceFilename}`);
    
    const duplicateCount = await prismaInterlink.import_category_batches.count({
        where: {
            source_filename: sourceFilename,
        },
    });

    if (duplicateCount > 0) {
        // พบไฟล์ซ้ำ: โยน Error เพื่อให้ API Route ดักจับ
        throw new Error(`File already imported or pending. Source filename '${sourceFilename}' found in batch log.`);
    }
    console.log(`[File Service] Filename check successful. Continuing with file copy.`);
    // ---------------------------------------------------------------------------------
    
    // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
    await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
    
    const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
    
    console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
    
    try {
        // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
        await copyFile(latestFile.filePath, localDestinationFilePath);
        console.log(`Successfully copied file: ${latestFile.filename}`);
    } catch (copyError) {
        console.error(`Error copying Excel file from Shared Drive:`, copyError);
        throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
    }

    // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
    const categoryData = await readCategoryExcelFile(localDestinationFilePath);
    
    if (categoryData.length === 0) {
        throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
    }
    
    // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
    const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

    return batchResult;
}

/**
 * 🎯 ฟังก์ชันสำหรับทดสอบการอ่านไฟล์ Excel โดยตรงจาก Local Temp Path
 * @param filename - ชื่อไฟล์ที่ต้องการทดสอบ (เช่น 'test_read.xlsx') 
 * * 💡 วิธีใช้: Export ฟังก์ชันนี้ไปใช้ใน route.ts ชั่วคราว และนำไฟล์ Excel มาวางใน public/temp/excel_imports/
 */
export async function testExcelRead(filename: string): Promise<CategoryImportItem[]> {
    const filePath = path.join(LOCAL_TEMP_EXCEL_PATH, filename);

    console.log(`--- Running testExcelRead on: ${filePath} ---`);
    try {
        // ตรวจสอบว่าไฟล์อยู่จริง
        await access(filePath, constants.R_OK); 
        console.log('File found and readable by fs/promises. Attempting xlsx read...');
        
        // รันฟังก์ชันอ่านไฟล์หลัก
        const data = await readCategoryExcelFile(filePath);
        console.log(`Successfully read ${data.length} records.`);
        return data;

    } catch (error) {
        console.error(`Test failed for file ${filename}. Error:`, error);
        throw new Error(`Test read failed for ${filename}. Check if file exists in public/temp/excel_imports and has correct structure. Error: ${(error as Error).message}`);
    }
}


// === 4. UPDATED FOLDER CREATION FUNCTION ===

/**
 * 🎯 Service: สร้างโฟลเดอร์สำหรับ Category Images ตามข้อมูลใน Batch Log
 * 💡 เปลี่ยน Signature: รับ optional batchId แทน Array ของ Category Items
 * 💡 เปลี่ยน Logic: ดึง Batch Log ที่สถานะ FOLDERS_CREATING มาประมวลผล
 * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุจะหา Batch ล่าสุด
 * @returns ผลลัพธ์การประมวลผล (FolderProcessResult)
 */
export async function createCategoryFolders(batchId?: number): Promise<FolderProcessResult> {
    await setInterlinkSessionTZ();

    let batchLog: import_category_batches | null = null;
    let dataList: FolderCreationItem[] = [];
    
    // 💡 กำหนดสถานะที่เกี่ยวข้อง
    const PENDING_STATUS = import_category_batches_status.FOLDERS_CREATING; // สถานะเริ่มต้นของขั้นตอนนี้
    const NEXT_STATUS = import_category_batches_status.FOLDERS_CREATED;    // สถานะเมื่อสำเร็จ
    const ERROR_STATUS = import_category_batches_status.ERROR;            // สถานะเมื่อเกิดข้อผิดพลาด
    
    // 💡 กำหนด Path หลักสำหรับอัปโหลด (Local และ Shared)
    let sharedGraphicPath: string;
    let currentBatchId: number | undefined;

    try {
        // --- 1. ดึงค่า Shared Path จาก DB ---
        const configPath = await getConfigSetting('shared_graphic_path');
        if (!configPath) {
            throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
        }
        sharedGraphicPath = configPath;
        
        // --- 2. ค้นหา Batch Log ที่ต้องการประมวลผล ---
        if (batchId) {
            batchLog = await prismaInterlink.import_category_batches.findUnique({
                where: { id: BigInt(batchId), status: PENDING_STATUS } 
            });
        } else {
            // ค้นหา Batch ล่าสุดที่เป็น FOLDERS_CREATING
            batchLog = await prismaInterlink.import_category_batches.findFirst({
                where: { status: PENDING_STATUS }, 
                orderBy: { id: 'desc' }
            });
        }

        if (!batchLog) {
            return {
                success: false,
                count: 0,
                message: batchId 
                    ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
                    : `No batches found with status ${PENDING_STATUS}.`,
            };
        }
        
        currentBatchId = Number(batchLog.id);

        // --- 3. แปลง JSON String เป็น Array of Categories ---
        const jsonString = batchLog.category_data;
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            // ดึงเฉพาะ slug ที่จำเป็นสำหรับสร้างโฟลเดอร์
            const fullData = JSON.parse(jsonString) as { slug: string }[];
            dataList = fullData.map(item => ({ slug: item.slug }));
        }

        if (!Array.isArray(dataList) || dataList.length === 0) {
            // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
            await prismaInterlink.import_category_batches.update({
                where: { id: batchLog.id }, 
                data: {
                    status: ERROR_STATUS,
                    processed_at: new Date(),
                    error_details: 'Category data in batch log is empty or invalid JSON array for folder creation.'
                }
            });
            return {
                success: false,
                batchId: currentBatchId,
                count: 0,
                message: `Batch ID ${currentBatchId} failed. Data is invalid or empty for folder creation.`,
                error_details: 'Invalid data format in batch log for folder creation.'
            };
        }
        
        // --- 4. เตรียม Path หลักสำหรับ Local และ Shared ---
        const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
        const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
        
        // --- 5. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน (ถ้ายังไม่มี) ---
        // (Shared Base Path ถูกตรวจสอบแล้วโดย getConfigSetting และ shared_graphic_path น่าจะเป็นโฟลเดอร์ปลายทางอยู่แล้ว)
        await mkdir(LOCAL_BASE_PATH, { recursive: true });
        
        // --- 6. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง ---
        let foldersProcessedCount = 0; // จำนวนโฟลเดอร์ปลายทางที่พยายามสร้าง (Local + Shared)
        let failedSlugs: string[] = [];

        for (const item of dataList) {
            const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
            const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);
            let localSuccess = true;
            let sharedSuccess = true;

            // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
            const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
                try {
                    await mkdir(folderPath, { recursive: true });
                    foldersProcessedCount++;
                    return true;
                } catch (error) {
                    // หากไม่ใช่ Error: EEXIST (โฟลเดอร์มีอยู่แล้ว) ถือเป็น Failure
                    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
                        console.error(`Error creating folder for ${item.slug} (${location}):`, error);
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
                failedSlugs.push(item.slug);
            }
        }
        
        // --- 7. ตรวจสอบความสำเร็จและอัปเดตสถานะ Batch Log ---
        if (failedSlugs.length > 0) {
            const errorMsg = `Folder creation partially failed. Failed slugs: ${failedSlugs.join(', ')}. Total items processed: ${dataList.length}`;
            
            // หากมี Category ที่สร้างไม่สำเร็จเลย (FailedSlugs == dataList.length) ให้เป็น ERROR
            const finalStatus = (failedSlugs.length < dataList.length) ? NEXT_STATUS : ERROR_STATUS; 

            await prismaInterlink.import_category_batches.update({
                where: { id: batchLog.id }, 
                data: {
                    status: finalStatus,
                    processed_at: new Date(),
                    error_details: errorMsg,
                }
            });

            return {
                success: (finalStatus === NEXT_STATUS), // สำเร็จถ้าส่งต่อไปขั้นถัดไปได้
                batchId: currentBatchId,
                count: foldersProcessedCount,
                message: `Partially successful. ${dataList.length - failedSlugs.length} categories completed. ${failedSlugs.length} failed. Status set to ${finalStatus}.`,
                error_details: errorMsg,
            };
        }

        // --- 8. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATED (สำเร็จสมบูรณ์) ---
        await prismaInterlink.import_category_batches.update({
            where: { id: batchLog.id }, 
            data: {
                status: NEXT_STATUS, // 💡 อัปเดตเป็น FOLDERS_CREATED
                processed_at: new Date(),
            }
        });

        return {
            success: true,
            batchId: currentBatchId,
            count: foldersProcessedCount,
            message: `${dataList.length} category folder pairs successfully created/verified (Batch ID: ${currentBatchId}). Status set to ${NEXT_STATUS}.`,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown error during folder creation process.";
        
        // --- 9. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
        if (batchLog) {
            try {
                await prismaInterlink.import_category_batches.update({
                    where: { id: batchLog.id }, 
                    data: {
                        status: ERROR_STATUS,
                        processed_at: new Date(),
                        error_details: `Folder creation process failed: ${errorDetails}`,
                    }
                });
            } catch (logError) {
                console.error("Failed to update batch status to ERROR after main failure:", logError);
            }
        }
        
        console.error(`Fatal Error in createCategoryFolders for Batch ID ${currentBatchId || 'N/A'}:`, error);

        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to execute category folder creation for Batch ID ${currentBatchId || 'N/A'}.`,
            error_details: errorDetails,
        };
    }
}


/**
 * 🎯 Service: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
 * 💡 NEW SIGNATURE: รับ optional batchId แทน Array ของ Category Items
 * 💡 NEW LOGIC: ดึง Batch Log ที่สถานะ FOLDERS_CREATED มาประมวลผลการคัดลอกรูปภาพ
 * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุจะหา Batch ล่าสุด
 * @returns ผลลัพธ์การประมวลผล (ImageProcessResult)
 */
export async function copyCategoryImages(batchId?: number): Promise<ImageProcessResult> {
    await setInterlinkSessionTZ();

    let batchLog: import_category_batches | null = null;
    let categorySlugs: string[] = [];
    let currentBatchId: number | undefined;

    // 💡 กำหนดสถานะที่เกี่ยวข้องตาม enum ที่ถูกต้อง
    const PENDING_STATUS = import_category_batches_status.FOLDERS_CREATED;  // สถานะที่ต้องเป็นก่อนเริ่มขั้นตอนนี้
    const PROCESSING_STATUS = import_category_batches_status.IMAGES_COPYING; // 💡 แก้ไข: ใช้ IMAGES_COPYING เป็นสถานะระหว่างดำเนินการ
    const NEXT_STATUS = import_category_batches_status.COMPLETED;            // 💡 แก้ไข: ใช้ COMPLETED เป็นสถานะเมื่อสำเร็จ
    const ERROR_STATUS = import_category_batches_status.ERROR;

    try {
        // --- 1. ดึงค่า Shared Path และกำหนด Local Base Path ---
        const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
        if (!sharedGraphicPath) {
            throw new Error('Shared graphic path is not configured. Cannot proceed with image copying.');
        }
        const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');

        // --- 2. ค้นหา Batch Log ที่ต้องการประมวลผล ---
        if (batchId) {
            batchLog = await prismaInterlink.import_category_batches.findUnique({
                where: { id: BigInt(batchId), status: PENDING_STATUS }
            });
        } else {
            // ค้นหา Batch ล่าสุดที่เป็น FOLDERS_CREATED
            batchLog = await prismaInterlink.import_category_batches.findFirst({
                where: { status: PENDING_STATUS },
                orderBy: { id: 'desc' }
            });
        }
        
        if (!batchLog) {
            return {
                success: true, // ถือว่าสำเร็จ เพราะไม่มีงานให้ทำ (ไม่ใช่ความผิดพลาด)
                count: 0,
                message: batchId 
                    ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
                    : `No batches found with status ${PENDING_STATUS}.`,
            };
        }

        currentBatchId = Number(batchLog.id);
        console.log(`Starting image copying for Batch ID: ${currentBatchId}`);

        // --- 3. ตั้งสถานะ Batch เป็น IMAGES_COPYING (เพื่อป้องกันการรันซ้ำ) ---
        await prismaInterlink.import_category_batches.update({
            where: { id: batchLog.id },
            data: { status: PROCESSING_STATUS }
        });
        
        // --- 4. แปลง JSON String เป็น Array ของ Category Slugs ---
        const jsonString = batchLog.category_data;
        if (typeof jsonString === 'string' && jsonString.length > 0) {
            const fullData = JSON.parse(jsonString) as { slug: string }[];
            // กรองและดึงเฉพาะ slug ที่มีค่า
            categorySlugs = fullData
                .map(item => item.slug)
                .filter(slug => typeof slug === 'string' && slug.trim().length > 0);
        }

        if (categorySlugs.length === 0) {
            // ตั้งค่าเป็น NEXT_STATUS (COMPLETED) เพราะกระบวนการทำงานสำเร็จแล้ว แม้จะไม่มีข้อมูลก็ตาม
            const message = `Category data in batch log is empty or invalid JSON array for image copying in Batch ID ${currentBatchId}. Setting status to ${NEXT_STATUS}.`;
            await prismaInterlink.import_category_batches.update({
                 where: { id: batchLog.id }, 
                 data: { status: NEXT_STATUS, processed_at: new Date() }
            });
            return { success: true, batchId: currentBatchId, count: 0, message };
        }

        let processedCount = 0;
        let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
        let folderAccessErrors: string[] = []; // เก็บข้อผิดพลาดในการเข้าถึงโฟลเดอร์ Shared

        // --- 5. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์ (Shared Drive) ---
        for (const slug of categorySlugs) {
            const sharedFolder = path.join(sharedGraphicPath, slug);
            
            try {
                // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
                const filenames = await readdir(sharedFolder);
                
                // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
                const imageFiles = filenames
                    .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
                    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })); // ปรับปรุงการเรียงลำดับให้ถูกต้องตามตัวเลข (เช่น 1, 2, 10)
                
                // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
                imageFiles.forEach((filename, index) => {
                    allImagesToProcess.push({
                        slug: slug,
                        filename: filename,
                        display_order: index, // เริ่มที่ 1 เพื่อความชัดเจนในการแสดงผล
                    });
                });

            } catch (error) {
                // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
                const errorMsg = `Could not access shared folder for slug: ${slug}. Error: ${(error as Error).message}`;
                console.warn(`Warning: ${errorMsg}`);
                folderAccessErrors.push(slug); // เก็บ slug ที่มีปัญหา
            }
        }

        // --- 6. ตรวจสอบว่ามีรูปภาพให้ประมวลผลหรือไม่ ---
        if (allImagesToProcess.length === 0) {
            const message = `Completed batch ${currentBatchId}. Found 0 images to process across ${categorySlugs.length} categories.`;
            
            await prismaInterlink.import_category_batches.update({
                where: { id: batchLog.id },
                data: {
                    status: NEXT_STATUS, // ถึงแม้จะไม่มีรูปภาพ ก็ถือว่าจบกระบวนการนี้แล้ว
                    processed_at: new Date(),
                    error_details: folderAccessErrors.length > 0 ? `Folder access failures for slugs: ${folderAccessErrors.join(', ')}` : null,
                }
            });

            return { success: true, batchId: currentBatchId, count: 0, message: message };
        }

        // --- 7. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง ---
        const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
        const categories = await prismaInterlink.ui_categories.findMany({
            where: { slug: { in: slugsWithImages } },
            select: { id: true, slug: true },
        });
        const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));

        // --- 8. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB) ---
        let imageProcessingErrors: string[] = []; // เก็บข้อผิดพลาดในการประมวลผลรูปภาพ
        
        for (const item of allImagesToProcess) {
            const categoryId = categoryIdMap.get(item.slug);
            if (!categoryId) {
                // ถ้า Category ไม่มีในตาราง ui_categories ให้ข้ามไป
                imageProcessingErrors.push(`DB Error: Category ID not found for slug ${item.slug}.`);
                continue;
            }

            // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
            const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
            
            // กำหนดชื่อไฟล์ปลายทาง WEBP
            const baseName = path.parse(item.filename).name;
            const webpFilename = `${baseName}.webp`;
            
            // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
            const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
            const destinationFilePath = path.join(destinationFolder, webpFilename);

            try {
                
                // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
                const imageBuffer = await readFile(sourceFilePath);
                // 💡 ปรับปรุง: ใช้ fit: 'contain' เพื่อให้แน่ใจว่าภาพไม่ถูกครอบตัด
                await sharp(imageBuffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
                    .webp({ quality: 100 }) // แปลงเป็น WebP คุณภาพ 80%
                    .toFile(destinationFilePath);
                
                // b) Upsert ข้อมูลลง DB
                // ใช้การค้นหา/อัปเดต/สร้าง เพื่อความแม่นยำในการใช้ field ที่ไม่ซ้ำกัน
                const existingImage = await prismaInterlink.images_categories.findFirst({
                    where: {
                        category_id: categoryId,
                        image_name: webpFilename,
                    },
                });

                if (existingImage) {
                    // อัปเดตถ้ามีอยู่แล้ว (อัปเดต display_order และ visible)
                    await prismaInterlink.images_categories.update({
                        where: { id: existingImage.id },
                        data: {
                            display_order: item.display_order,
                            visible: true,
                        },
                    });
                } else {
                    // สร้างใหม่ถ้ายังไม่มี
                    await prismaInterlink.images_categories.create({
                        data: {
                            category_id: categoryId,
                            image_name: webpFilename,
                            display_order: item.display_order,
                            visible: true,
                            // เพิ่ม created_at ที่นี่ถ้า Schema มี field นี้
                        },
                    });
                }
                
                processedCount++;
                
            } catch (error) {
                const errorMsg = `Failed to process/save/update DB for ${item.slug}/${item.filename}. Error: ${(error as Error).message}`;
                console.warn(`Warning: ${errorMsg}`);
                imageProcessingErrors.push(errorMsg);
            }
        }
        
        // --- 9. อัปเดตสถานะ Batch Log (สำเร็จ/สำเร็จบางส่วน) ---
        let finalStatus: import_category_batches_status = NEXT_STATUS; // Default to COMPLETED
        let finalMessage: string;
        let finalErrorDetails = folderAccessErrors.length > 0 || imageProcessingErrors.length > 0
            ? JSON.stringify({
                folder_access_issues: folderAccessErrors,
                image_processing_issues: imageProcessingErrors
              })
            : null;
        
        if (processedCount === 0 && allImagesToProcess.length > 0) {
            // หากมีรูปภาพที่ตั้งใจจะประมวลผล แต่ประมวลผลสำเร็จ 0 รูป
            finalStatus = ERROR_STATUS;
            finalMessage = `CRITICAL FAILURE: No images were successfully processed in Batch ID ${currentBatchId}. Found ${allImagesToProcess.length} images but all failed. Check error details.`;
        } else if (imageProcessingErrors.length > 0) {
            // สำเร็จบางส่วน
            finalMessage = `Partial success in Batch ID ${currentBatchId}. Processed ${processedCount} images successfully, but encountered ${imageProcessingErrors.length} image errors and ${folderAccessErrors.length} folder access issues. Status set to ${NEXT_STATUS} with warnings.`;
        } else {
             // สำเร็จสมบูรณ์
             finalMessage = `${processedCount} images successfully processed for Batch ID ${currentBatchId}. Status set to ${NEXT_STATUS}.`;
        }

        await prismaInterlink.import_category_batches.update({
            where: { id: batchLog.id }, 
            data: {
                status: finalStatus,
                processed_at: new Date(),
                error_details: finalErrorDetails,
            }
        });

        console.log(`Finished image copying for Batch ID: ${currentBatchId}. Result: ${finalMessage}`);

        return {
            success: (finalStatus === NEXT_STATUS),
            batchId: currentBatchId,
            count: processedCount,
            message: finalMessage,
            error_details: finalErrorDetails,
        };

    } catch (error) {
        const errorDetails = error instanceof Error ? error.message : "Unknown error during image copying process.";
        
        // --- 10. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาดรุนแรง ---
        if (batchLog) {
            try {
                // หาก Batch Log ถูกดึงขึ้นมาแล้ว ให้อัปเดตสถานะเป็น ERROR
                await prismaInterlink.import_category_batches.update({
                    where: { id: batchLog.id }, 
                    data: {
                        status: ERROR_STATUS,
                        processed_at: new Date(),
                        error_details: `Image copying process failed (Fatal Error): ${errorDetails}`,
                    }
                });
            } catch (logError) {
                console.error("Failed to update batch status to ERROR after main failure:", logError);
            }
        }
        
        console.error(`Fatal Error in copyCategoryImages for Batch ID ${currentBatchId || 'N/A'}:`, error);

        return {
            success: false,
            batchId: currentBatchId,
            count: 0,
            message: `Failed to execute category image copying for Batch ID ${currentBatchId || 'N/A'}.`,
            error_details: errorDetails,
        };
    }
}

// v.1.1.9 ===================================================================

// v.1.1.8 ===================================================================
// // src/services/file.service.ts
// import path from 'path';
// // 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
// import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx
// // 💡 NEW: Import Enum และ Type จาก Prisma สำหรับ Batch Log
// import { import_category_batches_status } from "@prisma/generated/interlink"; 
// import { import_category_batches } from "@prisma/generated/interlink"; // ใช้ Type ที่ตรงกับตาราง

// // === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// // 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders (เดิม)
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//     // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//     slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//     items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }

// // 💡 NEW: กำหนด Type สำหรับ Return Value ของ Service
// export interface FolderProcessResult {
//     success: boolean;
//     batchId?: number;
//     count: number; // จำนวนโฟลเดอร์ที่พยายามสร้าง
//     message: string;
//     error_details?: string;
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
// const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
//  */
// export async function getConfigSetting(key: string): Promise<string | null> {
//     try {
//         await setInterlinkSessionTZ();
//         const setting = await prismaInterlink.config_setting.findFirst({
//             where: { setting_key: key },
//             select: { setting_value: true },
//         });

//         return setting?.setting_value || null;
//     } catch (error) {
//         console.error(`Error fetching config setting '${key}':`, error);
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// // === 2. BATCH LOG SERVICE FUNCTIONS ===

// /**
//  * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveCategoryBatchLog(
//     dataList: CategoryImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
//     
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const categoryJson = JSON.stringify(dataList);

//     const result = await prismaInterlink.import_category_batches.create({
//         data: {
//             category_data: categoryJson,
//             source_filename: filename,
//             total_records: dataList.length,
//             status: import_category_batches_status.PENDING, // 💡 ใช้ Enum PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }

// // === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
//         const filenames = await readdir(excelPath);
//         
//         // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
//         
//         if (categoryFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of categoryFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 // NOTE: ยังคงต้องใช้ lstat บน Network Path
//                 const fileStat = await lstat(filePath);

//                 // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//                 // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
//         throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ CategoryImportItem
//  */
// async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
//     console.log(`Reading and parsing Excel file from local path: ${filePath}`);
//     
//     try {
//         // 1. อ่านไฟล์เป็น Buffer ด้วย fs/promises (เพื่อตรวจสอบการเข้าถึงไฟล์)
//         const fileBuffer = await readFile(filePath);

//         // 2. ใช้ xlsx.read จาก Buffer แทนการใช้ xlsx.readFile ตรงๆ
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         
//         // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
//         // NOTE: xlsx.utils.sheet_to_json จะอ่านค่าจากคอลัมน์ตามลำดับที่กำหนดใน Array Header
//         // 🚨 FIX: เพิ่ม 'image_filename' เพื่อให้ตรงกับโครงสร้าง 5 คอลัมน์ (A, B, C, D, E)
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['slug', 'name', 'image_filename', 'display_order', 'visible'], 
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
//         
//         // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             // เนื่องจากเราไม่ใช้ 'image_filename' ใน CategoryImportItem เราจึงกรองมันทิ้งไป
//             // แต่เราต้อง filter row ที่ slug หรือ name ว่างออกไปก่อน
//             .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
//             .map((row, index) => {
//                 
//                 // 1. ตรวจสอบ display_order และใช้ index เป็น Fallback
//                 // ค่า display_order จะถูกอ่านจากคอลัมน์ D แล้วตอนนี้
//                 let orderValue = parseInt(row.display_order);
//                 if (isNaN(orderValue)) {
//                     orderValue = index; // ใช้ index เป็นค่าเริ่มต้นที่ปลอดภัย
//                     console.warn(`Warning: Invalid display_order value ('${row.display_order}') found at row ${index + 2}. Using index ${index} as fallback.`);
//                 }

//                 // 2. ตรวจสอบ visible (Excel มักจะเก็บ 1/0 หรือ true/false)
//                 // ค่า visible จะถูกอ่านจากคอลัมน์ E แล้วตอนนี้
//                 let isVisible = true;
//                 if (row.visible !== null && row.visible !== undefined) {
//                     // แปลงค่าจาก Excel (1/0 หรือ 'TRUE'/'FALSE') ให้เป็น Boolean
//                     const rowVisible = String(row.visible).toLowerCase();
//                     if (rowVisible === '0' || rowVisible === 'false') {
//                         isVisible = false;
//                     } else if (rowVisible === '1' || rowVisible === 'true') {
//                         isVisible = true;
//                     }
//                 }
//                 
//                 return { 
//                     // Clean และ Validate ข้อมูล
//                     slug: String(row.slug).toLowerCase().trim(),
//                     name: String(row.name).trim(),
//                     
//                     // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา display_order)
//                     display_order: orderValue, 
//                     
//                     // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา visible Hardcode)
//                     visible: isVisible, 
//                 };
//             });

//     } catch (error) {
//         console.error(`Error reading or parsing Excel file ${filePath}:`, error);
//         // 🚨 อัปเดต Error Message ให้สะท้อนปัญหา
//         throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: Cannot access file. (Reason: ${(error as Error).message})`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
//  * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
//  */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
//     
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
//     
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
//     
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
//     
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
//     
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
//     
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
//     }
//     
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }

// /**
//  * 🎯 ฟังก์ชันสำหรับทดสอบการอ่านไฟล์ Excel โดยตรงจาก Local Temp Path
//  * @param filename - ชื่อไฟล์ที่ต้องการทดสอบ (เช่น 'test_read.xlsx') 
//  * * 💡 วิธีใช้: Export ฟังก์ชันนี้ไปใช้ใน route.ts ชั่วคราว และนำไฟล์ Excel มาวางใน public/temp/excel_imports/
//  */
// export async function testExcelRead(filename: string): Promise<CategoryImportItem[]> {
//     const filePath = path.join(LOCAL_TEMP_EXCEL_PATH, filename);

//     console.log(`--- Running testExcelRead on: ${filePath} ---`);
//     try {
//         // ตรวจสอบว่าไฟล์อยู่จริง
//         await access(filePath, constants.R_OK); 
//         console.log('File found and readable by fs/promises. Attempting xlsx read...');
//         
//         // รันฟังก์ชันอ่านไฟล์หลัก
//         const data = await readCategoryExcelFile(filePath);
//         console.log(`Successfully read ${data.length} records.`);
//         return data;

//     } catch (error) {
//         console.error(`Test failed for file ${filename}. Error:`, error);
//         throw new Error(`Test read failed for ${filename}. Check if file exists in public/temp/excel_imports and has correct structure. Error: ${(error as Error).message}`);
//     }
// }


// // === 4. UPDATED FOLDER CREATION FUNCTION ===

// /**
//  * 🎯 Service: สร้างโฟลเดอร์สำหรับ Category Images ตามข้อมูลใน Batch Log
//  * 💡 เปลี่ยน Signature: รับ optional batchId แทน Array ของ Category Items
//  * 💡 เปลี่ยน Logic: ดึง Batch Log ที่สถานะ FOLDERS_CREATING มาประมวลผล
//  * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุจะหา Batch ล่าสุด
//  * @returns ผลลัพธ์การประมวลผล (FolderProcessResult)
//  */
// export async function createCategoryFolders(batchId?: number): Promise<FolderProcessResult> {
//     await setInterlinkSessionTZ();

//     let batchLog: import_category_batches | null = null;
//     let dataList: FolderCreationItem[] = [];
    
//     // 💡 กำหนดสถานะที่เกี่ยวข้อง
//     const PENDING_STATUS = import_category_batches_status.FOLDERS_CREATING; // สถานะเริ่มต้นของขั้นตอนนี้
//     const NEXT_STATUS = import_category_batches_status.FOLDERS_CREATED;    // สถานะเมื่อสำเร็จ
//     const ERROR_STATUS = import_category_batches_status.ERROR;            // สถานะเมื่อเกิดข้อผิดพลาด
    
//     // 💡 กำหนด Path หลักสำหรับอัปโหลด (Local และ Shared)
//     let sharedGraphicPath: string;
//     let currentBatchId: number | undefined;

//     try {
//         // --- 1. ดึงค่า Shared Path จาก DB ---
//         const configPath = await getConfigSetting('shared_graphic_path');
//         if (!configPath) {
//             throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//         }
//         sharedGraphicPath = configPath;
        
//         // --- 2. ค้นหา Batch Log ที่ต้องการประมวลผล ---
//         if (batchId) {
//             batchLog = await prismaInterlink.import_category_batches.findUnique({
//                 where: { id: BigInt(batchId), status: PENDING_STATUS } 
//             });
//         } else {
//             // ค้นหา Batch ล่าสุดที่เป็น FOLDERS_CREATING
//             batchLog = await prismaInterlink.import_category_batches.findFirst({
//                 where: { status: PENDING_STATUS }, 
//                 orderBy: { id: 'desc' }
//             });
//         }

//         if (!batchLog) {
//             return {
//                 success: false,
//                 count: 0,
//                 message: batchId 
//                     ? `Batch ID ${batchId} not found or is not in ${PENDING_STATUS} status.`
//                     : `No batches found with status ${PENDING_STATUS}.`,
//             };
//         }
        
//         currentBatchId = Number(batchLog.id);

//         // --- 3. แปลง JSON String เป็น Array of Categories ---
//         const jsonString = batchLog.category_data;
//         if (typeof jsonString === 'string' && jsonString.length > 0) {
//             // ดึงเฉพาะ slug ที่จำเป็นสำหรับสร้างโฟลเดอร์
//             const fullData = JSON.parse(jsonString) as { slug: string }[];
//             dataList = fullData.map(item => ({ slug: item.slug }));
//         }

//         if (!Array.isArray(dataList) || dataList.length === 0) {
//             // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
//             await prismaInterlink.import_category_batches.update({
//                 where: { id: batchLog.id }, 
//                 data: {
//                     status: ERROR_STATUS,
//                     processed_at: new Date(),
//                     error_details: 'Category data in batch log is empty or invalid JSON array for folder creation.'
//                 }
//             });
//             return {
//                 success: false,
//                 batchId: currentBatchId,
//                 count: 0,
//                 message: `Batch ID ${currentBatchId} failed. Data is invalid or empty for folder creation.`,
//                 error_details: 'Invalid data format in batch log for folder creation.'
//             };
//         }
        
//         // --- 4. เตรียม Path หลักสำหรับ Local และ Shared ---
//         const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//         const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
        
//         // --- 5. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน (ถ้ายังไม่มี) ---
//         // (Shared Base Path ถูกตรวจสอบแล้วโดย getConfigSetting และ shared_graphic_path น่าจะเป็นโฟลเดอร์ปลายทางอยู่แล้ว)
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
        
//         // --- 6. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง ---
//         let foldersProcessedCount = 0; // จำนวนโฟลเดอร์ปลายทางที่พยายามสร้าง (Local + Shared)
//         let failedSlugs: string[] = [];

//         for (const item of dataList) {
//             const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//             const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);
//             let localSuccess = true;
//             let sharedSuccess = true;

//             // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//             const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//                 try {
//                     await mkdir(folderPath, { recursive: true });
//                     foldersProcessedCount++;
//                     return true;
//                 } catch (error) {
//                     // หากไม่ใช่ Error: EEXIST (โฟลเดอร์มีอยู่แล้ว) ถือเป็น Failure
//                     if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                         console.error(`Error creating folder for ${item.slug} (${location}):`, error);
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
//                 failedSlugs.push(item.slug);
//             }
//         }
        
//         // --- 7. ตรวจสอบความสำเร็จและอัปเดตสถานะ Batch Log ---
//         if (failedSlugs.length > 0) {
//             const errorMsg = `Folder creation partially failed. Failed slugs: ${failedSlugs.join(', ')}. Total items processed: ${dataList.length}`;
            
//             // หากมี Category ที่สร้างไม่สำเร็จเลย (FailedSlugs == dataList.length) ให้เป็น ERROR
//             const finalStatus = (failedSlugs.length < dataList.length) ? NEXT_STATUS : ERROR_STATUS; 

//             await prismaInterlink.import_category_batches.update({
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
//                 message: `Partially successful. ${dataList.length - failedSlugs.length} categories completed. ${failedSlugs.length} failed. Status set to ${finalStatus}.`,
//                 error_details: errorMsg,
//             };
//         }

//         // --- 8. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATED (สำเร็จสมบูรณ์) ---
//         await prismaInterlink.import_category_batches.update({
//             where: { id: batchLog.id }, 
//             data: {
//                 status: NEXT_STATUS, // 💡 อัปเดตเป็น FOLDERS_CREATED
//                 processed_at: new Date(),
//             }
//         });

//         return {
//             success: true,
//             batchId: currentBatchId,
//             count: foldersProcessedCount,
//             message: `${dataList.length} category folder pairs successfully created/verified (Batch ID: ${currentBatchId}). Status set to ${NEXT_STATUS}.`,
//         };

//     } catch (error) {
//         const errorDetails = error instanceof Error ? error.message : "Unknown error during folder creation process.";
        
//         // --- 9. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
//         if (batchLog) {
//             try {
//                 await prismaInterlink.import_category_batches.update({
//                     where: { id: batchLog.id }, 
//                     data: {
//                         status: ERROR_STATUS,
//                         processed_at: new Date(),
//                         error_details: `Folder creation process failed: ${errorDetails}`,
//                     }
//                 });
//             } catch (logError) {
//                 console.error("Failed to update batch status to ERROR after main failure:", logError);
//             }
//         }
        
//         console.error(`Fatal Error in createCategoryFolders for Batch ID ${currentBatchId || 'N/A'}:`, error);

//         return {
//             success: false,
//             batchId: currentBatchId,
//             count: 0,
//             message: `Failed to execute category folder creation for Batch ID ${currentBatchId || 'N/A'}.`,
//             error_details: errorDetails,
//         };
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
// // ... โค้ดส่วนนี้ไม่ได้ถูกแก้ไข ...
//     const { items } = request;
//     let processedCount = 0;
//     let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
//     
//     await setInterlinkSessionTZ();

//     // 1. ดึง Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     if (!sharedGraphicPath) {
//         throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//     }
//     const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     
//     // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//     for (const item of items) {
//         const sharedFolder = path.join(sharedGraphicPath, item.slug);
//         
//         try {
//             // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//             const filenames = await readdir(sharedFolder);
//             
//             // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//             const imageFiles = filenames
//                 .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                 .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
//             
//             // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//             imageFiles.forEach((filename, index) => {
//                 allImagesToProcess.push({
//                     slug: item.slug,
//                     filename: filename,
//                     display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//                 });
//             });

//         } catch (error) {
//             // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//             console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//         }
//     }

//         // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//         if (allImagesToProcess.length === 0) {
//             return { count: 0 };
//         }

//     // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//     const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//     const categories = await prismaInterlink.ui_categories.findMany({
//         where: { slug: { in: slugsWithImages } },
//         select: { id: true, slug: true },
//     });
//     const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//     // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//     for (const item of allImagesToProcess) {
//         const categoryId = categoryIdMap.get(item.slug);
//         if (!categoryId) {
//             continue;
//         }

//         // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//         const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
//         
//         // กำหนดชื่อไฟล์ปลายทาง WEBP
//         const baseName = path.parse(item.filename).name;
//         const webpFilename = `${baseName}.webp`;
//         
//         // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//         const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//         const destinationFilePath = path.join(destinationFolder, webpFilename);

//         try {
//             
//             // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//             const imageBuffer = await readFile(sourceFilePath);
//             await sharp(imageBuffer)
//                 .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//                 .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//                 .toFile(destinationFilePath);
//             
//             // b) Upsert ข้อมูลลง DB
//             // 1. ค้นหารายการที่มีอยู่
//             const existingImage = await prismaInterlink.images_categories.findFirst({
//                 where: {
//                     category_id: categoryId,
//                     image_name: webpFilename,
//                 },
//             });

//             if (existingImage) {
//                 // 2. อัปเดตถ้ามีอยู่แล้ว
//                 await prismaInterlink.images_categories.update({
//                     where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//                     data: {
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             } else {
//                 // 3. สร้างใหม่ถ้ายังไม่มี
//                 await prismaInterlink.images_categories.create({
//                     data: {
//                         category_id: categoryId,
//                         image_name: webpFilename,
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             }
//             
//             processedCount++;
//             
//         } catch (error) {
//             console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//         }
//     }

//     return { count: processedCount };
// }

// v.1.1.8 ===================================================================

// v.1.1.7 =================================================================== version work
// // src/services/file.service.ts

// import path from 'path';
// // 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
// import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx

// // === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// // 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//     // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//     slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//     items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
// const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
//  */
// export async function getConfigSetting(key: string): Promise<string | null> {
//     try {
//         await setInterlinkSessionTZ();
//         const setting = await prismaInterlink.config_setting.findFirst({
//             where: { setting_key: key },
//             select: { setting_value: true },
//         });

//         return setting?.setting_value || null;
//     } catch (error) {
//         console.error(`Error fetching config setting '${key}':`, error);
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// // === 2. BATCH LOG SERVICE FUNCTIONS ===

// /**
//  * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveCategoryBatchLog(
//     dataList: CategoryImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
//     
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const categoryJson = JSON.stringify(dataList);

//     const result = await prismaInterlink.import_category_batches.create({
//         data: {
//             category_data: categoryJson,
//             source_filename: filename,
//             total_records: dataList.length,
//             status: 'PENDING', // ตั้งสถานะเริ่มต้นเป็น PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }

// // === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
//         const filenames = await readdir(excelPath);
//         
//         // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
//         
//         if (categoryFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of categoryFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 // NOTE: ยังคงต้องใช้ lstat บน Network Path
//                 const fileStat = await lstat(filePath);

//                 // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//                 // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
//         throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ CategoryImportItem
//  */
// async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
//     console.log(`Reading and parsing Excel file from local path: ${filePath}`);
//     
//     try {
//         // 1. อ่านไฟล์เป็น Buffer ด้วย fs/promises (เพื่อตรวจสอบการเข้าถึงไฟล์)
//         const fileBuffer = await readFile(filePath);

//         // 2. ใช้ xlsx.read จาก Buffer แทนการใช้ xlsx.readFile ตรงๆ
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         
//         // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
//         // NOTE: xlsx.utils.sheet_to_json จะอ่านค่าจากคอลัมน์ตามลำดับที่กำหนดใน Array Header
//         // 🚨 FIX: เพิ่ม 'image_filename' เพื่อให้ตรงกับโครงสร้าง 5 คอลัมน์ (A, B, C, D, E)
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['slug', 'name', 'image_filename', 'display_order', 'visible'], 
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
//         
//         // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             // เนื่องจากเราไม่ใช้ 'image_filename' ใน CategoryImportItem เราจึงกรองมันทิ้งไป
//             // แต่เราต้อง filter row ที่ slug หรือ name ว่างออกไปก่อน
//             .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
//             .map((row, index) => {
//                 
//                 // 1. ตรวจสอบ display_order และใช้ index เป็น Fallback
//                 // ค่า display_order จะถูกอ่านจากคอลัมน์ D แล้วตอนนี้
//                 let orderValue = parseInt(row.display_order);
//                 if (isNaN(orderValue)) {
//                     orderValue = index; // ใช้ index เป็นค่าเริ่มต้นที่ปลอดภัย
//                     console.warn(`Warning: Invalid display_order value ('${row.display_order}') found at row ${index + 2}. Using index ${index} as fallback.`);
//                 }

//                 // 2. ตรวจสอบ visible (Excel มักจะเก็บ 1/0 หรือ true/false)
//                 // ค่า visible จะถูกอ่านจากคอลัมน์ E แล้วตอนนี้
//                 let isVisible = true;
//                 if (row.visible !== null && row.visible !== undefined) {
//                     // แปลงค่าจาก Excel (1/0 หรือ 'TRUE'/'FALSE') ให้เป็น Boolean
//                     const rowVisible = String(row.visible).toLowerCase();
//                     if (rowVisible === '0' || rowVisible === 'false') {
//                         isVisible = false;
//                     } else if (rowVisible === '1' || rowVisible === 'true') {
//                         isVisible = true;
//                     }
//                 }
//                 
//                 return { 
//                     // Clean และ Validate ข้อมูล
//                     slug: String(row.slug).toLowerCase().trim(),
//                     name: String(row.name).trim(),
//                     
//                     // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา display_order)
//                     display_order: orderValue, 
//                     
//                     // 🛠️ NEW: ใช้ค่าที่แปลงแล้ว (แก้ไขปัญหา visible Hardcode)
//                     visible: isVisible, 
//                 };
//             });

//     } catch (error) {
//         console.error(`Error reading or parsing Excel file ${filePath}:`, error);
//         // 🚨 อัปเดต Error Message ให้สะท้อนปัญหา
//         throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: Cannot access file. (Reason: ${(error as Error).message})`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
//  * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
//  */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
//     
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
//     
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
//     
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
//     
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
//     
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
//     
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
//     }
//     
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }

// /**
//  * 🎯 ฟังก์ชันสำหรับทดสอบการอ่านไฟล์ Excel โดยตรงจาก Local Temp Path
//  * @param filename - ชื่อไฟล์ที่ต้องการทดสอบ (เช่น 'test_read.xlsx') 
//  * * 💡 วิธีใช้: Export ฟังก์ชันนี้ไปใช้ใน route.ts ชั่วคราว และนำไฟล์ Excel มาวางใน public/temp/excel_imports/
//  */
// export async function testExcelRead(filename: string): Promise<CategoryImportItem[]> {
//     const filePath = path.join(LOCAL_TEMP_EXCEL_PATH, filename);

//     console.log(`--- Running testExcelRead on: ${filePath} ---`);
//     try {
//         // ตรวจสอบว่าไฟล์อยู่จริง
//         await access(filePath, constants.R_OK); 
//         console.log('File found and readable by fs/promises. Attempting xlsx read...');
//         
//         // รันฟังก์ชันอ่านไฟล์หลัก
//         const data = await readCategoryExcelFile(filePath);
//         console.log(`Successfully read ${data.length} records.`);
//         return data;

//     } catch (error) {
//         console.error(`Test failed for file ${filename}. Error:`, error);
//         throw new Error(`Test read failed for ${filename}. Check if file exists in public/temp/excel_imports and has correct structure. Error: ${(error as Error).message}`);
//     }
// }


// // === 4. EXISTING FILE FUNCTIONS (NO CHANGE) ===

// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//     let createdCount = 0;
//     
//     // 1. ดึงค่า Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     
//     if (!sharedGraphicPath) {
//         // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//         throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//     }

//     // 2. กำหนด Path หลักสำหรับ Local และ Shared
//     const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
//     
//     // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//     try {
//         await access(LOCAL_BASE_PATH);
//     } catch (error) {
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//     }
//     
//     // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//     try {
//         await access(SHARED_BASE_PATH);
//     } catch (error) {
//         await mkdir(SHARED_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//     }


//     // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//     for (const item of items) {
//         const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//         const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//         // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//         const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//             try {
//                 await mkdir(folderPath, { recursive: true });
//                 createdCount++;
//             } catch (error) {
//                 if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                     console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//                 }
//             }
//         };

//         // รันพร้อมกัน
//         await Promise.all([
//             createFolder(localDestinationPath, 'Local'),
//             createFolder(sharedDestinationPath, 'Shared')
//         ]);
//     }

//     return { count: createdCount };
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
//     const { items } = request;
//     let processedCount = 0;
//     let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
//     
//     await setInterlinkSessionTZ();

//     // 1. ดึง Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     if (!sharedGraphicPath) {
//         throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//     }
//     const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     
//     // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//     for (const item of items) {
//         const sharedFolder = path.join(sharedGraphicPath, item.slug);
//         
//         try {
//             // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//             const filenames = await readdir(sharedFolder);
//             
//             // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//             const imageFiles = filenames
//                 .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                 .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
//             
//             // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//             imageFiles.forEach((filename, index) => {
//                 allImagesToProcess.push({
//                     slug: item.slug,
//                     filename: filename,
//                     display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//                 });
//             });

//         } catch (error) {
//             // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//             console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//         }
//     }

//         // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//         if (allImagesToProcess.length === 0) {
//             return { count: 0 };
//         }

//     // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//     const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//     const categories = await prismaInterlink.ui_categories.findMany({
//         where: { slug: { in: slugsWithImages } },
//         select: { id: true, slug: true },
//     });
//     const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//     // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//     for (const item of allImagesToProcess) {
//         const categoryId = categoryIdMap.get(item.slug);
//         if (!categoryId) {
//             continue;
//         }

//         // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//         const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
//         
//         // กำหนดชื่อไฟล์ปลายทาง WEBP
//         const baseName = path.parse(item.filename).name;
//         const webpFilename = `${baseName}.webp`;
//         
//         // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//         const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//         const destinationFilePath = path.join(destinationFolder, webpFilename);

//         try {
//             
//             // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//             const imageBuffer = await readFile(sourceFilePath);
//             await sharp(imageBuffer)
//                 .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//                 .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//                 .toFile(destinationFilePath);
//             
//             // b) Upsert ข้อมูลลง DB
//             // 1. ค้นหารายการที่มีอยู่
//             const existingImage = await prismaInterlink.images_categories.findFirst({
//                 where: {
//                     category_id: categoryId,
//                     image_name: webpFilename,
//                 },
//             });

//             if (existingImage) {
//                 // 2. อัปเดตถ้ามีอยู่แล้ว
//                 await prismaInterlink.images_categories.update({
//                     where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//                     data: {
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             } else {
//                 // 3. สร้างใหม่ถ้ายังไม่มี
//                 await prismaInterlink.images_categories.create({
//                     data: {
//                         category_id: categoryId,
//                         image_name: webpFilename,
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             }
//             
//             processedCount++;
//             
//         } catch (error) {
//             console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//         }
//     }

//     return { count: processedCount };
// }

// v.1.1.7 ===================================================================

// v.1.1.6 ===================================================================
// // src/services/file.service.ts

// import path from 'path';
// // 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
// import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx

// // === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// // 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//     // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//     slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//     items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
// const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

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
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// // === 2. BATCH LOG SERVICE FUNCTIONS ===

// /**
//  * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveCategoryBatchLog(
//     dataList: CategoryImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
    
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const categoryJson = JSON.stringify(dataList);

//     const result = await prismaInterlink.import_category_batches.create({
//         data: {
//             category_data: categoryJson,
//             source_filename: filename,
//             total_records: dataList.length,
//             status: 'PENDING', // ตั้งสถานะเริ่มต้นเป็น PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }

// // === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
//         const filenames = await readdir(excelPath);
        
//         // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
        
//         if (categoryFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of categoryFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 // NOTE: ยังคงต้องใช้ lstat บน Network Path
//                 const fileStat = await lstat(filePath);

//                 // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//                 // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
//         throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ CategoryImportItem
//  */
// async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
//     console.log(`Reading and parsing Excel file from local path: ${filePath}`);
    
//     try {
//         // 1. อ่านไฟล์เป็น Buffer ด้วย fs/promises (เพื่อตรวจสอบการเข้าถึงไฟล์)
//         const fileBuffer = await readFile(filePath);

//         // 2. ใช้ xlsx.read จาก Buffer แทนการใช้ xlsx.readFile ตรงๆ
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['slug', 'name', 'display_order', 'visible'], // กำหนด Header
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
        
//         // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
//             .map((row, index) => ({ // 💡 เพิ่ม index สำหรับใช้กำหนด display_order
//                 // Clean และ Validate ข้อมูล
//                 slug: String(row.slug).toLowerCase().trim(),
//                 name: String(row.name).trim(),
                
//                 // 🛠️ แก้ไข display_order: ใช้ index (0, 1, 2...) เป็นค่าเริ่มต้นที่ปลอดภัย
//                 // ถ้าค่าใน Excel อ่านไม่ได้หรือไม่ใช่ตัวเลข ให้ใช้ index แทน (0, 1, 2, ...)
//                 display_order: !isNaN(parseInt(row.display_order)) ? parseInt(row.display_order) : index, 
                
//                 // 🛠️ แก้ไข visible: Hardcode เป็น true ตามความต้องการของคุณ (เพื่อให้เป็น 1 ใน DB)
//                 visible: true, 
//             }));

//     } catch (error) {
//         console.error(`Error reading or parsing Excel file ${filePath}:`, error);
//         // 🚨 อัปเดต Error Message ให้สะท้อนปัญหา
//         throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: Cannot access file. (Reason: ${(error as Error).message})`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
//  * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
//  */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
    
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
    
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
    
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
    
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
    
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
    
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
//     }
    
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }

// /**
//  * 🎯 ฟังก์ชันสำหรับทดสอบการอ่านไฟล์ Excel โดยตรงจาก Local Temp Path
//  * @param filename - ชื่อไฟล์ที่ต้องการทดสอบ (เช่น 'test_read.xlsx') 
//  * * 💡 วิธีใช้: Export ฟังก์ชันนี้ไปใช้ใน route.ts ชั่วคราว และนำไฟล์ Excel มาวางใน public/temp/excel_imports/
//  */
// export async function testExcelRead(filename: string): Promise<CategoryImportItem[]> {
//     const filePath = path.join(LOCAL_TEMP_EXCEL_PATH, filename);

//     console.log(`--- Running testExcelRead on: ${filePath} ---`);
//     try {
//         // ตรวจสอบว่าไฟล์อยู่จริง
//         await access(filePath, constants.R_OK); 
//         console.log('File found and readable by fs/promises. Attempting xlsx read...');
        
//         // รันฟังก์ชันอ่านไฟล์หลัก
//         const data = await readCategoryExcelFile(filePath);
//         console.log(`Successfully read ${data.length} records.`);
//         return data;

//     } catch (error) {
//         console.error(`Test failed for file ${filename}. Error:`, error);
//         throw new Error(`Test read failed for ${filename}. Check if file exists in public/temp/excel_imports and has correct structure. Error: ${(error as Error).message}`);
//     }
// }


// // === 4. EXISTING FILE FUNCTIONS (NO CHANGE) ===

// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//     let createdCount = 0;
    
//     // 1. ดึงค่า Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
    
//     if (!sharedGraphicPath) {
//         // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//         throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//     }

//     // 2. กำหนด Path หลักสำหรับ Local และ Shared
//     const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
    
//     // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//     try {
//         await access(LOCAL_BASE_PATH);
//     } catch (error) {
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//     }
    
//     // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//     try {
//         await access(SHARED_BASE_PATH);
//     } catch (error) {
//         await mkdir(SHARED_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//     }


//     // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//     for (const item of items) {
//         const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//         const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//         // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//         const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//             try {
//                 await mkdir(folderPath, { recursive: true });
//                 createdCount++;
//             } catch (error) {
//                 if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                     console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//                 }
//             }
//         };

//         // รันพร้อมกัน
//         await Promise.all([
//             createFolder(localDestinationPath, 'Local'),
//             createFolder(sharedDestinationPath, 'Shared')
//         ]);
//     }

//     return { count: createdCount };
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
//     const { items } = request;
//     let processedCount = 0;
//     let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
    
//     await setInterlinkSessionTZ();

//     // 1. ดึง Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     if (!sharedGraphicPath) {
//         throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//     }
//     const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
    
//     // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//     for (const item of items) {
//         const sharedFolder = path.join(sharedGraphicPath, item.slug);
        
//         try {
//             // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//             const filenames = await readdir(sharedFolder);
            
//             // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//             const imageFiles = filenames
//                 .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                 .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
            
//             // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//             imageFiles.forEach((filename, index) => {
//                 allImagesToProcess.push({
//                     slug: item.slug,
//                     filename: filename,
//                     display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//                 });
//             });

//         } catch (error) {
//             // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//             console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//         }
//     }

//         // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//         if (allImagesToProcess.length === 0) {
//             return { count: 0 };
//         }

//     // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//     const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//     const categories = await prismaInterlink.ui_categories.findMany({
//         where: { slug: { in: slugsWithImages } },
//         select: { id: true, slug: true },
//     });
//     const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//     // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//     for (const item of allImagesToProcess) {
//         const categoryId = categoryIdMap.get(item.slug);
//         if (!categoryId) {
//             continue;
//         }

//         // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//         const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
        
//         // กำหนดชื่อไฟล์ปลายทาง WEBP
//         const baseName = path.parse(item.filename).name;
//         const webpFilename = `${baseName}.webp`;
        
//         // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//         const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//         const destinationFilePath = path.join(destinationFolder, webpFilename);

//         try {
            
//             // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//             const imageBuffer = await readFile(sourceFilePath);
//             await sharp(imageBuffer)
//                 .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//                 .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//                 .toFile(destinationFilePath);
            
//             // b) Upsert ข้อมูลลง DB
//             // 1. ค้นหารายการที่มีอยู่
//             const existingImage = await prismaInterlink.images_categories.findFirst({
//                 where: {
//                     category_id: categoryId,
//                     image_name: webpFilename,
//                 },
//             });

//             if (existingImage) {
//                 // 2. อัปเดตถ้ามีอยู่แล้ว
//                 await prismaInterlink.images_categories.update({
//                     where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//                     data: {
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             } else {
//                 // 3. สร้างใหม่ถ้ายังไม่มี
//                 await prismaInterlink.images_categories.create({
//                     data: {
//                         category_id: categoryId,
//                         image_name: webpFilename,
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             }
            
//             processedCount++;
            
//         } catch (error) {
//             console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//         }
//     }

//     return { count: processedCount };
// }
// v.1.1.6 ===================================================================

// v.1.1.5 ===================================================================
// // src/services/file.service.ts

// import path from 'path';
// // 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
// import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx

// // === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// // 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//     // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//     slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//     items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
// const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

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
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// // === 2. BATCH LOG SERVICE FUNCTIONS ===

// /**
//  * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveCategoryBatchLog(
//     dataList: CategoryImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
    
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const categoryJson = JSON.stringify(dataList);

//     const result = await prismaInterlink.import_category_batches.create({
//         data: {
//             category_data: categoryJson,
//             source_filename: filename,
//             total_records: dataList.length,
//             status: 'PENDING', // ตั้งสถานะเริ่มต้นเป็น PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }

// // === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
//         const filenames = await readdir(excelPath);
        
//         // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
        
//         if (categoryFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of categoryFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 // NOTE: ยังคงต้องใช้ lstat บน Network Path
//                 const fileStat = await lstat(filePath);

//                 // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//                 // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
//         throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ CategoryImportItem
//  */
// async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
//     console.log(`Reading and parsing Excel file from local path: ${filePath}`);
    
//     try {
//         // อ่านไฟล์ (จาก Local Path)
//         // 🚨 ปรับ: เพิ่ม 'readFileSync' และ 'type' เพื่อความพยายามในการอ่านสูงสุด
//         // บางครั้ง 'readFile' ใน xlsx มีปัญหาเรื่องสิทธิ์การเข้าถึงไฟล์ที่ถูก Lock ชั่วคราว
        
//         // 1. อ่านไฟล์เป็น Buffer ด้วย fs/promises (เพื่อตรวจสอบการเข้าถึงไฟล์)
//         const fileBuffer = await readFile(filePath);

//         // 2. ใช้ xlsx.read จาก Buffer แทนการใช้ xlsx.readFile ตรงๆ
//         //     โดยการใช้ Buffer อาจจะเลี่ยงปัญหาเรื่องสิทธิ์ได้ดีกว่า
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         // const workbook = xlsx.readFile(filePath); // <-- โค้ดเดิมที่อาจมีปัญหา
        
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['slug', 'name', 'display_order', 'visible'], // กำหนด Header
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
        
//         // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
//             .map(row => ({
//                 // Clean และ Validate ข้อมูล
//                 slug: String(row.slug).toLowerCase().trim(),
//                 name: String(row.name).trim(),
//                 display_order: parseInt(row.display_order) || 999, // ถ้า parse ไม่ได้ ให้เป็น 999
//                 // visible เป็น boolean (แปลง 1 หรือ '1' เป็น true)
//                 visible: (String(row.visible) === '1' || String(row.visible).toLowerCase() === 'true' || row.visible === 1), 
//             }));

//     } catch (error) {
//         console.error(`Error reading or parsing Excel file ${filePath}:`, error);
//         // 🚨 อัปเดต Error Message ให้สะท้อนปัญหา
//         throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: Cannot access file. (Reason: ${(error as Error).message})`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
//  * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
//  */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
    
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
    
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
    
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
    
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
    
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
    
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data. (It may be empty or header/data format is incorrect)`);
//     }
    
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }

// /**
//  * 🎯 ฟังก์ชันสำหรับทดสอบการอ่านไฟล์ Excel โดยตรงจาก Local Temp Path
//  * @param filename - ชื่อไฟล์ที่ต้องการทดสอบ (เช่น 'test_read.xlsx') 
//  * * 💡 วิธีใช้: Export ฟังก์ชันนี้ไปใช้ใน route.ts ชั่วคราว และนำไฟล์ Excel มาวางใน public/temp/excel_imports/
//  */
// export async function testExcelRead(filename: string): Promise<CategoryImportItem[]> {
//     const filePath = path.join(LOCAL_TEMP_EXCEL_PATH, filename);

//     console.log(`--- Running testExcelRead on: ${filePath} ---`);
//     try {
//         // ตรวจสอบว่าไฟล์อยู่จริง
//         await access(filePath, constants.R_OK); 
//         console.log('File found and readable by fs/promises. Attempting xlsx read...');
        
//         // รันฟังก์ชันอ่านไฟล์หลัก
//         const data = await readCategoryExcelFile(filePath);
//         console.log(`Successfully read ${data.length} records.`);
//         return data;

//     } catch (error) {
//         console.error(`Test failed for file ${filename}. Error:`, error);
//         throw new Error(`Test read failed for ${filename}. Check if file exists in public/temp/excel_imports and has correct structure. Error: ${(error as Error).message}`);
//     }
// }


// // === 4. EXISTING FILE FUNCTIONS (NO CHANGE) ===
// // ... (ฟังก์ชัน createCategoryFolders และ copyCategoryImages ยังคงเดิม) ...
// // เพื่อความกระชับในการตอบกลับ ผมขอละส่วนนี้ไว้ แต่ในไฟล์จริงที่ส่งให้คุณคือไฟล์ฉบับเต็ม

// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//     let createdCount = 0;
    
//     // 1. ดึงค่า Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
    
//     if (!sharedGraphicPath) {
//         // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//         throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//     }

//     // 2. กำหนด Path หลักสำหรับ Local และ Shared
//     const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
    
//     // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//     try {
//         await access(LOCAL_BASE_PATH);
//     } catch (error) {
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//     }
    
//     // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//     try {
//         await access(SHARED_BASE_PATH);
//     } catch (error) {
//         await mkdir(SHARED_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//     }


//     // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//     for (const item of items) {
//         const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//         const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//         // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//         const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//             try {
//                 await mkdir(folderPath, { recursive: true });
//                 createdCount++;
//             } catch (error) {
//                 if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                     console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//                 }
//             }
//         };

//         // รันพร้อมกัน
//         await Promise.all([
//             createFolder(localDestinationPath, 'Local'),
//             createFolder(sharedDestinationPath, 'Shared')
//         ]);
//     }

//     return { count: createdCount };
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
//     const { items } = request;
//     let processedCount = 0;
//     let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
    
//     await setInterlinkSessionTZ();

//     // 1. ดึง Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     if (!sharedGraphicPath) {
//         throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//     }
//     const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
    
//     // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//     for (const item of items) {
//         const sharedFolder = path.join(sharedGraphicPath, item.slug);
        
//         try {
//             // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//             const filenames = await readdir(sharedFolder);
            
//             // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//             const imageFiles = filenames
//                 .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                 .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
            
//             // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//             imageFiles.forEach((filename, index) => {
//                 allImagesToProcess.push({
//                     slug: item.slug,
//                     filename: filename,
//                     display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//                 });
//             });

//         } catch (error) {
//             // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//             console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//         }
//     }

//         // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//         if (allImagesToProcess.length === 0) {
//             return { count: 0 };
//         }

//     // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//     const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//     const categories = await prismaInterlink.ui_categories.findMany({
//         where: { slug: { in: slugsWithImages } },
//         select: { id: true, slug: true },
//     });
//     const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//     // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//     for (const item of allImagesToProcess) {
//         const categoryId = categoryIdMap.get(item.slug);
//         if (!categoryId) {
//             continue;
//         }

//         // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//         const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
        
//         // กำหนดชื่อไฟล์ปลายทาง WEBP
//         const baseName = path.parse(item.filename).name;
//         const webpFilename = `${baseName}.webp`;
        
//         // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//         const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//         const destinationFilePath = path.join(destinationFolder, webpFilename);

//         try {
            
//             // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//             const imageBuffer = await readFile(sourceFilePath);
//             await sharp(imageBuffer)
//                 .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//                 .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//                 .toFile(destinationFilePath);
            
//             // b) Upsert ข้อมูลลง DB
//             // 1. ค้นหารายการที่มีอยู่
//             const existingImage = await prismaInterlink.images_categories.findFirst({
//                 where: {
//                     category_id: categoryId,
//                     image_name: webpFilename,
//                 },
//             });

//             if (existingImage) {
//                 // 2. อัปเดตถ้ามีอยู่แล้ว
//                 await prismaInterlink.images_categories.update({
//                     where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//                     data: {
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             } else {
//                 // 3. สร้างใหม่ถ้ายังไม่มี
//                 await prismaInterlink.images_categories.create({
//                     data: {
//                         category_id: categoryId,
//                         image_name: webpFilename,
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             }
            
//             processedCount++;
            
//         } catch (error) {
//             console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//         }
//     }

//     return { count: processedCount };
// }

// v.1.1.5 ===================================================================

// v.1.1.4 ===================================================================
// // src/services/file.service.ts

// import path from 'path';
// // 💡 เพิ่ม copyFile เพื่อใช้ในการคัดลอกไฟล์จาก Network Share
// import { access, mkdir, constants, readFile, readdir, stat, lstat, copyFile } from 'fs/promises'; 
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // ต้องติดตั้ง: npm install sharp
// import * as xlsx from 'xlsx'; // ต้องติดตั้ง: npm install xlsx

// // === 1. INTERFACES FOR CATEGORY DATA & BATCH LOG ===

// // 💡 โครงสร้างข้อมูล Category ที่คาดว่าจะได้รับจาก Excel
// export interface CategoryImportItem {
//     slug: string;
//     name: string;
//     display_order: number;
//     visible: boolean;
// }

// // 💡 โครงสร้างสำหรับผลลัพธ์การบันทึก Batch Log
// export interface BatchLogResult {
//     batchId: bigint;
//     totalRecords: number;
//     sourceFilename: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//     // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//     slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//     items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }

// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // 💡 NEW: กำหนด Local Path สำหรับเก็บไฟล์ Excel ชั่วคราว
// const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_imports');

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
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// // === 2. BATCH LOG SERVICE FUNCTIONS ===

// /**
//  * 🎯 บันทึกข้อมูล Category ที่อ่านได้จาก Excel ลงในตาราง Staging (import_category_batches)
//  * พร้อมตั้งสถานะเป็น PENDING
//  * @param dataList - Array ของข้อมูล Category ที่อ่านได้จาก Excel
//  * @param filename - ชื่อไฟล์ Excel ต้นทาง
//  */
// export async function saveCategoryBatchLog(
//     dataList: CategoryImportItem[],
//     filename: string
// ): Promise<BatchLogResult> {
//     await setInterlinkSessionTZ();
    
//     // ใช้ JSON.stringify เพื่อแปลง Array of Object เป็น JSON String สำหรับเก็บในคอลัมน์ JSON
//     const categoryJson = JSON.stringify(dataList);

//     const result = await prismaInterlink.import_category_batches.create({
//         data: {
//             category_data: categoryJson,
//             source_filename: filename,
//             total_records: dataList.length,
//             status: 'PENDING', // ตั้งสถานะเริ่มต้นเป็น PENDING
//             // processed_at และ error_details จะถูกอัปเดตใน API /insert-db ภายหลัง
//         },
//     });

//     return {
//         batchId: result.id,
//         totalRecords: result.total_records,
//         sourceFilename: result.source_filename ?? filename,
//     };
// }

// // === 3. EXCEL FILE HANDLING FUNCTIONS (UPDATED) ===

// /**
//  * 🎯 ฟังก์ชันช่วย: ค้นหาไฟล์ Excel Category ล่าสุดใน Shared Drive Path
//  * @param excelPath - Path ของโฟลเดอร์ Excel ที่กำหนดใน config_setting (UNC Path)
//  * @returns {filePath: string, filename: string} หรือ null หากไม่พบ
//  */
// async function findLatestCategoryExcelFile(excelPath: string): Promise<{ filePath: string, filename: string } | null> {
//     try {
//         // NOTE: ยังคงใช้ excelPath (UNC Path) ในการ readdir
//         const filenames = await readdir(excelPath);
        
//         // 🚨 แก้ไข: กรองเฉพาะไฟล์ที่ตรงกับรูปแบบ category_YYYYMMDD.xlsx (ตัวเลข 8 หลัก)
//         const categoryFiles = filenames.filter(name => /^category_\d{8}\.xlsx$/i.test(name));
        
//         if (categoryFiles.length === 0) {
//             return null;
//         }

//         let latestFile: { filePath: string, filename: string, mtime: Date } | null = null;

//         // วนลูปตรวจสอบเวลาแก้ไข (mtime) ของแต่ละไฟล์
//         for (const filename of categoryFiles) {
//             const filePath = path.join(excelPath, filename);
//             try {
//                 // NOTE: ยังคงต้องใช้ lstat บน Network Path
//                 const fileStat = await lstat(filePath);

//                 // ข้ามถ้าเป็นโฟลเดอร์หรือ Symbolic Link
//                 if (!fileStat.isFile()) continue;

//                 const mtime = fileStat.mtime;

//                 // ใช้ mtime (Last Modified Time) ในการหาไฟล์ล่าสุด
//                 if (!latestFile || mtime > latestFile.mtime) {
//                     latestFile = { filePath, filename, mtime };
//                 }
//             } catch (err) {
//                 console.warn(`Could not read stat for file ${filename} in Shared Drive:`, (err as Error).message);
//                 // ดำเนินการต่อไปเพื่อตรวจสอบไฟล์อื่นๆ
//             }
//         }

//         if (!latestFile) {
//             return null;
//         }

//         return { filePath: latestFile.filePath, filename: latestFile.filename };

//     } catch (error) {
//         console.error(`Error reading Excel directory ${excelPath} from Shared Drive:`, error);
//         // โยน Error เพื่อให้ API ทราบว่าเข้าถึง Network Path ไม่ได้
//         throw new Error(`Failed to access Shared Excel path: ${excelPath}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันช่วย: อ่านและแปลงข้อมูลจาก Excel File
//  * 💡 ฟังก์ชันนี้จะรับ Local Path เท่านั้น
//  * @param filePath - Path ของไฟล์ Excel ที่จะอ่าน (Local Path)
//  * @returns Array ของ CategoryImportItem
//  */
// async function readCategoryExcelFile(filePath: string): Promise<CategoryImportItem[]> {
//     console.log(`Reading and parsing Excel file from local path: ${filePath}`);
    
//     try {
//         // อ่านไฟล์ (จาก Local Path)
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
        
//         // แปลงเป็น JSON Array โดยสมมติว่า Header อยู่ในแถวแรก (Row 1) และคอลัมน์เรียงตามนี้:
//         // A: slug, B: name, C: display_order, D: visible
//         const json = xlsx.utils.sheet_to_json<any>(sheet, {
//             header: ['slug', 'name', 'display_order', 'visible'], // กำหนด Header
//             range: 1, // เริ่มอ่านจากแถวที่ 2 (index 1) เพื่อข้าม header แถวแรก
//             defval: null, // ค่าเริ่มต้นเมื่อไม่มีข้อมูล
//         });
        
//         // กรองแถวที่ 'slug' เป็นค่าว่าง และ Map/แปลงข้อมูลให้ตรงตาม Interface
//         return json
//             .filter(row => row.slug !== null && row.slug !== undefined) // กรองแถวที่ไม่มี slug
//             .map(row => ({
//                 // Clean และ Validate ข้อมูล
//                 slug: String(row.slug).toLowerCase().trim(),
//                 name: String(row.name).trim(),
//                 display_order: parseInt(row.display_order) || 999, // ถ้า parse ไม่ได้ ให้เป็น 999
//                 // visible เป็น boolean (แปลง 1 หรือ '1' เป็น true)
//                 visible: (String(row.visible) === '1' || String(row.visible).toLowerCase() === 'true' || row.visible === 1), 
//             }));

//     } catch (error) {
//         console.error(`Error reading or parsing Excel file ${filePath}:`, error);
//         throw new Error(`Failed to read or parse Excel file: ${path.basename(filePath)}. Error: ${(error as Error).message}`);
//     }
// }


// /**
//  * 🎯 ฟังก์ชันหลักสำหรับ API /api/import/categories/read-excel (UPDATED)
//  * ดึง Path, หาไฟล์ล่าสุด, **COPY ไฟล์**, อ่านไฟล์, และบันทึกผลลัพธ์ลงตาราง Staging
//  */
// export async function readExcelAndSaveBatch(): Promise<BatchLogResult> {
//     // 1. ดึง Path จาก config_setting
//     const excelPath = await getConfigSetting('excel_category_path'); // นี่คือ UNC Path

//     if (!excelPath) {
//         throw new Error('Excel category path is not configured in config_setting table (key: excel_category_path).');
//     }
    
//     // 2. ค้นหาไฟล์ Excel ล่าสุด (จาก UNC Path)
//     const latestFile = await findLatestCategoryExcelFile(excelPath);

//     if (!latestFile) {
//         throw new Error(`No Excel files matching 'category_YYYYMMDD.xlsx' found in path: ${excelPath}`);
//     }
    
//     // 3. 💡 NEW: สร้างโฟลเดอร์ Local Temp และ Copy ไฟล์
//     await mkdir(LOCAL_TEMP_EXCEL_PATH, { recursive: true });
    
//     const localDestinationFilePath = path.join(LOCAL_TEMP_EXCEL_PATH, latestFile.filename);
    
//     console.log(`Attempting to copy file from Shared Drive (${latestFile.filePath}) to Local Temp (${localDestinationFilePath})`);
    
//     try {
//         // ใช้ copyFile เพื่อ Copy ไฟล์จาก Network Path ไปยัง Local Path
//         // นี่คือจุดเดียวที่ยังต้องใช้ Network Read Permission
//         await copyFile(latestFile.filePath, localDestinationFilePath);
//         console.log(`Successfully copied file: ${latestFile.filename}`);
//     } catch (copyError) {
//         console.error(`Error copying Excel file from Shared Drive:`, copyError);
//         // โยน Error ที่ชัดเจนกว่าเดิม
//         throw new Error(`Failed to copy Excel file from Shared Drive to Local: ${latestFile.filePath}. This is often due to Network Permission issues (Read access).`);
//     }

//     // 4. อ่านและแปลงข้อมูลจากไฟล์ Excel (จาก Local Path ที่เพิ่ง Copy มา)
//     // การอ่านจาก Local Path นี้ควรหลีกเลี่ยงปัญหา EPERM/Cannot access file ได้
//     const categoryData = await readCategoryExcelFile(localDestinationFilePath);
    
//     if (categoryData.length === 0) {
//         throw new Error(`Excel file ${latestFile.filename} was read but contains no valid category data.`);
//     }
    
//     // 5. บันทึกข้อมูลที่อ่านได้ลงในตาราง Batch Staging
//     const batchResult = await saveCategoryBatchLog(categoryData, latestFile.filename);

//     return batchResult;
// }


// // === 4. EXISTING FILE FUNCTIONS (NO CHANGE) ===

// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//     let createdCount = 0;
    
//     // 1. ดึงค่า Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
    
//     if (!sharedGraphicPath) {
//         // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//         throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//     }

//     // 2. กำหนด Path หลักสำหรับ Local และ Shared
//     const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//     const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
    
//     // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//     try {
//         await access(LOCAL_BASE_PATH);
//     } catch (error) {
//         await mkdir(LOCAL_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//     }
    
//     // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//     try {
//         await access(SHARED_BASE_PATH);
//     } catch (error) {
//         await mkdir(SHARED_BASE_PATH, { recursive: true });
//         console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//     }


//     // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//     for (const item of items) {
//         const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//         const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//         // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//         const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//             try {
//                 await mkdir(folderPath, { recursive: true });
//                 createdCount++;
//             } catch (error) {
//                 if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//                     console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//                 }
//             }
//         };

//         // รันพร้อมกัน
//         await Promise.all([
//             createFolder(localDestinationPath, 'Local'),
//             createFolder(sharedDestinationPath, 'Shared')
//         ]);
//     }

//     return { count: createdCount };
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
//     const { items } = request;
//     let processedCount = 0;
//     let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
    
//     await setInterlinkSessionTZ();

//     // 1. ดึง Shared Path จาก DB
//     const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//     if (!sharedGraphicPath) {
//         throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//     }
//     const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
    
//     // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//     for (const item of items) {
//         const sharedFolder = path.join(sharedGraphicPath, item.slug);
        
//         try {
//             // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//             const filenames = await readdir(sharedFolder);
            
//             // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//             const imageFiles = filenames
//                 .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//                 .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
            
//             // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//             imageFiles.forEach((filename, index) => {
//                 allImagesToProcess.push({
//                     slug: item.slug,
//                     filename: filename,
//                     display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//                 });
//             });

//         } catch (error) {
//             // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//             console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//         }
//     }

//         // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//         if (allImagesToProcess.length === 0) {
//             return { count: 0 };
//         }

//     // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//     const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//     const categories = await prismaInterlink.ui_categories.findMany({
//         where: { slug: { in: slugsWithImages } },
//         select: { id: true, slug: true },
//     });
//     const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//     // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//     for (const item of allImagesToProcess) {
//         const categoryId = categoryIdMap.get(item.slug);
//         if (!categoryId) {
//             continue;
//         }

//         // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//         const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
        
//         // กำหนดชื่อไฟล์ปลายทาง WEBP
//         const baseName = path.parse(item.filename).name;
//         const webpFilename = `${baseName}.webp`;
        
//         // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//         const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//         const destinationFilePath = path.join(destinationFolder, webpFilename);

//         try {
            
//             // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//             const imageBuffer = await readFile(sourceFilePath);
//             await sharp(imageBuffer)
//                 .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//                 .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//                 .toFile(destinationFilePath);
            
//             // b) Upsert ข้อมูลลง DB
//             // 1. ค้นหารายการที่มีอยู่
//             const existingImage = await prismaInterlink.images_categories.findFirst({
//                 where: {
//                     category_id: categoryId,
//                     image_name: webpFilename,
//                 },
//             });

//             if (existingImage) {
//                 // 2. อัปเดตถ้ามีอยู่แล้ว
//                 await prismaInterlink.images_categories.update({
//                     where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//                     data: {
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             } else {
//                 // 3. สร้างใหม่ถ้ายังไม่มี
//                 await prismaInterlink.images_categories.create({
//                     data: {
//                         category_id: categoryId,
//                         image_name: webpFilename,
//                         display_order: item.display_order,
//                         visible: true, 
//                     },
//                 });
//             }
            
//             processedCount++;
            
//         } catch (error) {
//             console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//         }
//     }

//     return { count: processedCount };
// }


// v.1.1.4 ===================================================================


// v.1.1.3 ===================================================================
// // src/services/file.service.ts

// import path from 'path';
// import { access, mkdir, constants, readFile, readdir } from 'fs/promises'; // 💡 เพิ่ม readdir
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import sharp from 'sharp'; // 💡 ต้องติดตั้ง: npm install sharp

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//   // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//   slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images (ปรับปรุงใหม่ให้รับเฉพาะ slug)
// export interface ImageProcessItem {
//     slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
// }

// export interface ImageProcessRequest {
//   items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
// }


// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');

// /**
//  * 🎯 ฟังก์ชันช่วย: ดึงค่า Config จากตาราง config_setting
//  * @param key - คีย์ของ Setting ที่ต้องการดึง
//  */
// export async function getConfigSetting(key: string): Promise<string | null> {
//     try {
//         await setInterlinkSessionTZ();
//         const setting = await prismaInterlink.config_setting.findFirst({
//             where: { setting_key: key },
//             select: { setting_value: true },
//         });

//         return setting?.setting_value || null;
//     } catch (error) {
//         console.error(`Error fetching config setting '${key}':`, error);
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  * ... (ฟังก์ชัน createCategoryFolders ไม่มีการเปลี่ยนแปลง)
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//   let createdCount = 0;
//   
//   // 1. ดึงค่า Shared Path จาก DB
//   const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//   
//   if (!sharedGraphicPath) {
//     // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//     throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//   }

//   // 2. กำหนด Path หลักสำหรับ Local และ Shared
//   const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//   const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
//   
//   // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//   try {
//     await access(LOCAL_BASE_PATH);
//   } catch (error) {
//     await mkdir(LOCAL_BASE_PATH, { recursive: true });
//     console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//   }
//   
//   // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//   try {
//     await access(SHARED_BASE_PATH);
//   } catch (error) {
//     await mkdir(SHARED_BASE_PATH, { recursive: true });
//     console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//   }


//   // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//   for (const item of items) {
//     const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//     const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//     // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//     const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//       try {
//         await mkdir(folderPath, { recursive: true });
//         createdCount++;
//       } catch (error) {
//         if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//           console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//         }
//       }
//     };

//     // รันพร้อมกัน
//     await Promise.all([
//       createFolder(localDestinationPath, 'Local'),
//       createFolder(sharedDestinationPath, 'Shared')
//     ]);
//   }

//   return { count: createdCount };
// }


// /**
//  * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
//  * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
//  */
// export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
//   const { items } = request;
//   let processedCount = 0;
//   let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
//   
//   await setInterlinkSessionTZ();

//   // 1. ดึง Shared Path จาก DB
//   const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//   if (!sharedGraphicPath) {
//     throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
//   }
//   const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//   
//   // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
//   for (const item of items) {
//     const sharedFolder = path.join(sharedGraphicPath, item.slug);
    
//     try {
//         // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
//         const filenames = await readdir(sharedFolder);
        
//         // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
//         const imageFiles = filenames
//             .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
//             .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
        
//         // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
//         imageFiles.forEach((filename, index) => {
//             allImagesToProcess.push({
//                 slug: item.slug,
//                 filename: filename,
//                 display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
//             });
//         });

//     } catch (error) {
//         // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
//         console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
//     }
//   }

//     // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
//     if (allImagesToProcess.length === 0) {
//         return { count: 0 };
//     }

//   // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
//   const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
//   const categories = await prismaInterlink.ui_categories.findMany({
//     where: { slug: { in: slugsWithImages } },
//     select: { id: true, slug: true },
//   });
//   const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


//   // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
//   for (const item of allImagesToProcess) {
//     const categoryId = categoryIdMap.get(item.slug);
//     if (!categoryId) {
//       continue;
//     }

//     // Source Path (Shared Drive): [Shared Path]/[slug]/[filename.jpg]
//     const sourceFilePath = path.join(sharedGraphicPath, item.slug, item.filename);
//     
//     // กำหนดชื่อไฟล์ปลายทาง WEBP
//     const baseName = path.parse(item.filename).name;
//     const webpFilename = `${baseName}.webp`;
//     
//     // Destination Path (Local Project): [Local Path]/[slug]/[filename.webp]
//     const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//     const destinationFilePath = path.join(destinationFolder, webpFilename);

//     try {
//         
//       // a) อ่าน, แปลง, และบันทึกไฟล์ (Process and Save WEBP)
//       const imageBuffer = await readFile(sourceFilePath);
//       await sharp(imageBuffer)
//           .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
//           .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
//           .toFile(destinationFilePath);
//       
//       // b) Upsert ข้อมูลลง DB
//       // 1. ค้นหารายการที่มีอยู่
//       const existingImage = await prismaInterlink.images_categories.findFirst({
//             where: {
//                 category_id: categoryId,
//                 image_name: webpFilename,
//             },
//         });

//       if (existingImage) {
//         // 2. อัปเดตถ้ามีอยู่แล้ว
//         await prismaInterlink.images_categories.update({
//             where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
//             data: {
//                 display_order: item.display_order,
//                 visible: true, 
//             },
//         });
//       } else {
//         // 3. สร้างใหม่ถ้ายังไม่มี
//         await prismaInterlink.images_categories.create({
//             data: {
//                 category_id: categoryId,
//                 image_name: webpFilename,
//                 display_order: item.display_order,
//                 visible: true, 
//             },
//         });
//       }
//       
//       processedCount++;
//       
//     } catch (error) {
//       console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
//     }
//   }

//   return { count: processedCount };
// }
// v.1.1.3 ===================================================================

// v.1.1.2 ===================================================================
// // src/services/file.service.ts
// import path from 'path';
// import { access, mkdir, copyFile, constants } from 'fs/promises';
// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db"; // เพิ่มการ Import DB


// // 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
// export interface FolderCreationRequest {
//     // Path Shared Drive ที่รับมาจาก Admin UI หรือ Config (เพื่อความยืดหยุ่น)
//     // ณ จุดนี้ เราจะใช้การ Query จาก DB ใน Service Layer แทนการรับจาก Body โดยตรง
//     // แต่เรายังคง FolderCreationItem[] ไว้สำหรับรายการ Category
//     items: FolderCreationItem[]; // Array ของ Category slug
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
// export interface FolderCreationItem {
//   // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//   slug: string;
// }

// // 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images (ยังเหมือนเดิม)
// export interface ImageCopyItem {
//   slug: string;
//   image_filename: string;
// }

// export interface ImageCopyRequest {
//   source_path: string; // Path ต้นทางที่เก็บรูปภาพทั้งหมด
//   items: ImageCopyItem[]; // Array ของ Category ที่ต้องการคัดลอก
// }


// // กำหนด Base Upload Path สำหรับ Local Project
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');

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
//         return null; // คืนค่า null หากเกิดข้อผิดพลาดในการเชื่อมต่อ DB หรือหาไม่เจอ
//     }
// }


// /**
//  * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
//  * 1. โฟลเดอร์ Local Project: [UPLOAD_ROOT_PATH]/categories/[slug]
//  * 2. โฟลเดอร์ Shared Drive: [SHARED_GRAPHIC_PATH]/[slug]
//  * @param items Array ของ Category slug
//  * @returns Promise ที่ส่งคืนจำนวนโฟลเดอร์ที่สร้าง/ตรวจสอบสำเร็จ
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//   let createdCount = 0;
//   
//   // 1. ดึงค่า Shared Path จาก DB
//   const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
//   
//   if (!sharedGraphicPath) {
//     // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
//     throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
//   }

//   // 2. กำหนด Path หลักสำหรับ Local และ Shared
//   const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
//   const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
//   
//   // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
//   try {
//     await access(LOCAL_BASE_PATH);
//   } catch (error) {
//     await mkdir(LOCAL_BASE_PATH, { recursive: true });
//     console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
//   }
//   
//   // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
//   try {
//     await access(SHARED_BASE_PATH);
//   } catch (error) {
//     await mkdir(SHARED_BASE_PATH, { recursive: true });
//     console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
//   }


//   // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
//   for (const item of items) {
//     const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
//     const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

//     // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
//     const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
//       try {
//         await mkdir(folderPath, { recursive: true });
//         createdCount++;
//       } catch (error) {
//         if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//           console.error(`Error creating folder for ${item.slug} (${location}):`, error);
//         }
//       }
//     };

//     // รันพร้อมกัน
//     await Promise.all([
//       createFolder(localDestinationPath, 'Local'),
//       createFolder(sharedDestinationPath, 'Shared')
//     ]);
//   }

//   return { count: createdCount };
// }


// /**
//  * คัดลอกไฟล์รูปภาพจาก Source Path ไปยังโฟลเดอร์ Category ปลายทาง
//  * ณ จุดนี้ยังไม่ได้รวม Logic การแปลงเป็น WEBP
//  * @param request ข้อมูลที่มี Source Path และรายการ Category
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่คัดลอกสำเร็จ
//  */
// export async function copyCategoryImages(request: ImageCopyRequest): Promise<{ count: number }> {
//   const { source_path, items } = request;
//   let copiedCount = 0;
//   
//   // โฟลเดอร์หลักสำหรับ Category ทั้งหมด (เช่น /public/uploads/categories)
//   const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');

//   // ตรวจสอบ Source Path ก่อน (Source Path คือ Shared Drive Path ในขั้นตอนถัดไป)
//   try {
//     await access(source_path, constants.R_OK); // ตรวจสอบว่า Source Path สามารถอ่านได้
//   } catch (error) {
//     throw new Error(`Source path not accessible or does not exist: ${source_path}`);
//   }
//   
//   // วนลูปเพื่อคัดลอกรูปภาพทีละรายการ
//   for (const item of items) {
//     // Source: Z:\Graphic\pday\categories_images\[slug]\[filename]
//     const sourceFilePath = path.join(source_path, item.slug, item.image_filename);
//     
//     // Destination: public/uploads/categories/[slug]\[filename]
//     const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//     const destinationFilePath = path.join(destinationFolder, item.image_filename);

//     try {
//       // 1. ตรวจสอบว่าไฟล์ต้นทางมีอยู่จริง
//       await access(sourceFilePath, constants.F_OK); 
//       
//       // 2. คัดลอกไฟล์ (ณ จุดนี้ยังไม่มีการแปลง WEBP)
//       await copyFile(sourceFilePath, destinationFilePath);
//       copiedCount++;
//     } catch (error) {
//       console.warn(`Warning: Could not copy image for ${item.slug}. Source file not found or error occurred: ${sourceFilePath}`, error);
//     }
//   }

//   return { count: copiedCount };
// }
// v.1.1.2 ===================================================================

// // src/services/file.service.ts

// import path from 'path';
// import { access, mkdir, copyFile, constants } from 'fs/promises';


// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา
// // อัปเดตเพื่อให้รวม image_filename ด้วย
// export interface ImageCopyItem {
//   slug: string;
//   image_filename: string;
// }

// // กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา
// export interface FolderCreationItem {
//   // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
//   slug: string;
// }

// // โครงสร้างสำหรับรับ Input Path
// export interface ImageCopyRequest {
//   source_path: string; // Path ต้นทางที่เก็บรูปภาพทั้งหมด
//   items: ImageCopyItem[]; // Array ของ Category ที่ต้องการคัดลอก
// }

// // กำหนด Base Upload Path จาก Environment Variable
// // สมมติว่าใน .env เรามี UPLOAD_BASE_PATH=/path/to/uploads
// // const UPLOAD_ROOT_PATH = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'uploads');
// const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');
// // หรือเพื่อให้สอดคล้องกับ .env ที่คุณกำหนด
// // const UPLOAD_ROOT_PATH = process.env.UPLOAD_BASE_PATH || path.join(process.cwd(), 'public');

// /**
//  * คัดลอกไฟล์รูปภาพจาก Source Path ไปยังโฟลเดอร์ Category ปลายทาง
//  * @param request ข้อมูลที่มี Source Path และรายการ Category
//  * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่คัดลอกสำเร็จ
//  */
// export async function copyCategoryImages(request: ImageCopyRequest): Promise<{ count: number }> {
//   const { source_path, items } = request;
//   let copiedCount = 0;
  
//   // โฟลเดอร์หลักสำหรับ Category ทั้งหมด (เช่น /public/categories)
//   const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');

//   // ตรวจสอบ Source Path ก่อน
//   try {
//     await access(source_path, constants.R_OK); // ตรวจสอบว่า Source Path สามารถอ่านได้
//   } catch (error) {
//     throw new Error(`Source path not accessible or does not exist: ${source_path}`);
//   }
  
//   // วนลูปเพื่อคัดลอกรูปภาพทีละรายการ
//   for (const item of items) {
//     const sourceFilePath = path.join(source_path, item.image_filename);
//     const destinationFolder = path.join(CATEGORY_BASE_PATH, item.slug);
//     const destinationFilePath = path.join(destinationFolder, item.image_filename);

//     try {
//       // 1. ตรวจสอบว่าไฟล์ต้นทางมีอยู่จริง
//       await access(sourceFilePath, constants.F_OK); 
      
//       // 2. คัดลอกไฟล์
//       // copyFile(source, destination) จะเขียนทับไฟล์เดิมถ้ามีชื่อซ้ำ
//       await copyFile(sourceFilePath, destinationFilePath);
//       copiedCount++;
//     } catch (error) {
//       // หากไฟล์ต้นทางไม่มี (F_OK fail) หรือมีข้อผิดพลาดอื่น
//       console.warn(`Warning: Could not copy image for ${item.slug}. Source file not found or error occurred: ${sourceFilePath}`, error);
//       // เราจะไม่โยน Error ออกไป เพราะเราต้องการให้รายการอื่นทำงานต่อ
//     }
//   }

//   return { count: copiedCount };
// }

// /**
//  * สร้างโฟลเดอร์สำหรับ Category โดยใช้ slug เป็นชื่อโฟลเดอร์
//  * โครงสร้างโฟลเดอร์: [UPLOAD_ROOT_PATH]/categories/[slug]
//  * @param items Array ของ Category slug
//  * @returns Promise ที่ส่งคืนจำนวนโฟลเดอร์ที่สร้างสำเร็จ
//  */
// export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
//   let createdCount = 0;
  
//   // โฟลเดอร์หลักสำหรับ Category ทั้งหมด (เช่น /uploads/categories)
//   const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');

//   // 1. ตรวจสอบและสร้างโฟลเดอร์หลัก /categories ก่อน
//   try {
//     await access(CATEGORY_BASE_PATH);
//   } catch (error) {
//     // ถ้าไม่มีโฟลเดอร์หลัก ให้สร้างขึ้นมา
//     await mkdir(CATEGORY_BASE_PATH, { recursive: true });
//     console.log(`Created base path: ${CATEGORY_BASE_PATH}`);
//   }

//   // 2. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category
//   for (const item of items) {
//     const destinationPath = path.join(CATEGORY_BASE_PATH, item.slug);

//     try {
//       // ใช้ recursive: true เพื่อให้สร้าง Parent Folder ให้ด้วยหากยังไม่มี
//       await mkdir(destinationPath, { recursive: true });
//       createdCount++;
//     } catch (error) {
//       // หากโฟลเดอร์มีอยู่แล้ว (ซึ่งเป็นเรื่องปกติใน Upsert/Update) จะไม่เกิด Error
//       // หากเกิด Error อื่นๆ จะทำการ Log ไว้
//       if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
//         console.error(`Error creating folder for ${item.slug}:`, error);
//       }
//     }
//   }

//   return { count: createdCount };
// }