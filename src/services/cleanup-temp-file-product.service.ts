// src/services/cleanup-temp-file-product.service.ts
// 🎯 Service: Cleans up old temporary Product Excel files, keeping only the latest one.

import path from 'path';
import { readdir, stat, unlink } from 'fs/promises';

// 🔴 FIX: กำหนด Local Path สำหรับไฟล์ Excel ชั่วคราวของ Product โดยเฉพาะ
const LOCAL_TEMP_EXCEL_PATH = path.join(process.cwd(), 'public/temp/excel_product_import');

// === INTERFACES ===

/** Interface สำหรับผลลัพธ์ของ Service การล้างไฟล์ */
export interface CleanupResult {
    success: boolean;
    filesDeletedCount: number;
    filesKept: number;
    filesKeptNames: string[];
    message: string;
    deletionErrors: string[];
}

// === SERVICE CLASS ===

/**
 * Class จัดการการทำความสะอาดไฟล์ชั่วคราวสำหรับการนำเข้าสินค้า (Product)
 */
export class CleanupTempFileProductService {

    /**
     * ดำเนินการลบไฟล์ Excel เก่าทั้งหมดในโฟลเดอร์ชั่วคราว ยกเว้นไฟล์ที่ใหม่ที่สุด
     * @returns CleanupResult
     */
    public async cleanupOldExcelFiles(): Promise<CleanupResult> {
        const result: CleanupResult = {
            success: false,
            filesDeletedCount: 0,
            filesKept: 0,
            filesKeptNames: [],
            message: '',
            deletionErrors: [],
        };

        try {
            // 1. อ่านรายการไฟล์ทั้งหมดในโฟลเดอร์
            let filenames: string[];
            try {
                filenames = await readdir(LOCAL_TEMP_EXCEL_PATH);
            } catch (error: any) {
                // หากโฟลเดอร์ไม่มีอยู่ ให้ถือว่าสำเร็จและแจ้งว่าไม่พบไฟล์
                if (error.code === 'ENOENT') {
                    result.message = `Directory not found or created: ${LOCAL_TEMP_EXCEL_PATH}. No files to cleanup.`;
                    result.success = true;
                    return result;
                }
                throw error; // ส่งต่อข้อผิดพลาดอื่น ๆ
            }
            
            // กรองเฉพาะไฟล์ Excel (เช่น .xlsx, .xls, .csv)
            const excelFiles = filenames.filter(name => 
                name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')
            );

            if (excelFiles.length === 0) {
                result.message = 'No Product Excel files found for cleanup.';
                result.success = true;
                return result;
            }

            // 2. ดึงข้อมูล Stat (รวมถึงเวลาสร้าง/แก้ไข) ของแต่ละไฟล์
            const fileStats = await Promise.all(excelFiles.map(async (name) => {
                const fullPath = path.join(LOCAL_TEMP_EXCEL_PATH, name);
                try {
                    const stats = await stat(fullPath);
                    // ใช้ mtimeMs (Modification Time in milliseconds) เพื่อหาไฟล์ที่ใหม่ที่สุด
                    return { name, fullPath, mtime: stats.mtimeMs }; 
                } catch (error: any) {
                    // หากดึง stat ไม่ได้ ให้บันทึก error และคืนค่า null
                    result.deletionErrors.push(`Failed to get stats for ${name}: ${error.message}`);
                    return null;
                }
            }));
            
            const validFiles = fileStats.filter(f => f !== null) as { name: string; fullPath: string; mtime: number }[];

            if (validFiles.length === 0) {
                result.message = 'Found files but failed to read metadata for all of them.';
                result.success = false;
                return result;
            }

            // 3. เรียงลำดับไฟล์ตาม Modification Time (จากใหม่ไปเก่า)
            validFiles.sort((a, b) => b.mtime - a.mtime);

            // 4. เก็บไฟล์ที่ใหม่ที่สุดไว้ (ไฟล์แรก)
            const fileToKeep = validFiles[0];
            const filesToDelete = validFiles.slice(1);

            result.filesKept = 1;
            result.filesKeptNames = [fileToKeep.name];
            
            // 5. ลบไฟล์ที่เหลือทั้งหมด
            const deletionPromises = filesToDelete.map(async (file) => {
                try {
                    await unlink(file.fullPath);
                    result.filesDeletedCount++;
                } catch (error: any) {
                    result.deletionErrors.push(`Failed to delete ${file.name}: ${error.message}`);
                }
            });

            await Promise.all(deletionPromises);

            // 6. สรุปผลลัพธ์
            const errorWarning = result.deletionErrors.length > 0 ? ` (with ${result.deletionErrors.length} warnings)` : '';
            result.message = `Product cleanup successful${errorWarning}. Kept: ${fileToKeep.name}. Deleted ${result.filesDeletedCount} old files.`;
            // ถือว่าสำเร็จจริง ๆ ถ้าไม่มี error ในการลบ
            result.success = result.deletionErrors.length === 0; 

            return result;

        } catch (error: any) {
            console.error('Fatal Service Error in cleanupOldExcelFiles (Product):', error);
            result.message = `Fatal error during product cleanup process: ${error.message}`;
            result.success = false;
            return result;
        }
    }
}