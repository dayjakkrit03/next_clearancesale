// src/services/cleanup-temp-file.service.ts

import * as fs from 'fs/promises';
import * as path from 'path';

// Interface สำหรับผลลัพธ์ที่ Service จะส่งกลับ
interface CleanupTempFileResult {
  success: boolean;
  message: string;
  filesKept: number;
  filesDeletedCount: number;
  filesKeptNames: string[];
  deletionErrors: string[];
}

// โฟลเดอร์ชั่วคราวสำหรับไฟล์ Excel ที่ถูกอัปโหลด
// NOTE: ใช้ process.cwd() เป็น Base Path
const TEMP_EXCEL_DIR = path.join(
  process.cwd(),
  'public',
  'temp',
  'excel_imports',
);

// ใช้ console แทน Logger ของ NestJS เพื่อหลีกเลี่ยงการขึ้นกับโมดูลภายนอก
const fileCleanupLogger = {
  log: (message: string) => console.log(`[CLEANUP SERVICE] INFO: ${message}`),
  warn: (message: string) => console.warn(`[CLEANUP SERVICE] WARN: ${message}`),
  error: (message: string, stack?: string) => console.error(`[CLEANUP SERVICE] ERROR: ${message}`, stack),
};

/**
 * CleanupTempFileService: จัดการการลบไฟล์ Excel ชั่วคราว โดยเก็บไฟล์ที่ใหม่ที่สุดไว้เพียงไฟล์เดียว
 * NOTE: ไม่มี @Injectable() เพื่อหลีกเลี่ยง Error 2307
 */
export class CleanupTempFileService {
  
  /**
   * ลบไฟล์ Excel ชั่วคราวทั้งหมดในโฟลเดอร์ TEMP_EXCEL_DIR โดยเหลือไว้เพียงไฟล์เดียวที่ใหม่ที่สุด
   * @returns ผลลัพธ์การดำเนินการ CleanupTempFileResult
   */
  async cleanupOldExcelFiles(): Promise<CleanupTempFileResult> {
    fileCleanupLogger.log(`Starting cleanup in: ${TEMP_EXCEL_DIR}`);
    const deletionErrors: string[] = [];
    let filesDeletedCount = 0;
    
    try {
      // 1. ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
      try {
        await fs.stat(TEMP_EXCEL_DIR);
      } catch (e: any) { 
        if (e.code === 'ENOENT') {
          const msg = 'Temporary directory does not exist. No cleanup required.';
          fileCleanupLogger.warn(msg);
          return {
            success: true,
            message: msg,
            filesKept: 0,
            filesDeletedCount: 0,
            filesKeptNames: [],
            deletionErrors: [],
          };
        }
        throw e; 
      }
      
      // 2. อ่านรายชื่อไฟล์ทั้งหมด
      const filenames = await fs.readdir(TEMP_EXCEL_DIR);
      
      // 3. กรองเฉพาะไฟล์ Excel (.xlsx หรือ .xls)
      const excelFiles = filenames.filter(filename => 
        filename.endsWith('.xlsx') || filename.endsWith('.xls')
      );
      
      if (excelFiles.length <= 1) {
        const msg = `Found ${excelFiles.length} Excel file(s). Cleanup skipped.`;
        fileCleanupLogger.log(msg);
        return {
          success: true,
          message: msg,
          filesKept: excelFiles.length,
          filesDeletedCount: 0,
          filesKeptNames: excelFiles,
          deletionErrors: [],
        };
      }
      
      // 4. ดึงข้อมูล Stat และจัดเรียงตามเวลาแก้ไขล่าสุด (mtimeMs)
      const fileStats = await Promise.all(
        excelFiles.map(async (filename) => {
          const fullPath = path.join(TEMP_EXCEL_DIR, filename);
          // ดึงข้อมูล stats ของไฟล์
          const stats = await fs.stat(fullPath); 
          // mtimeMs คือ timestamp ของการแก้ไขล่าสุด มีหน่วยเป็นมิลลิวินาที
          return { filename, fullPath, mtimeMs: stats.mtimeMs };
        })
      );
      
      // จัดเรียงจากใหม่ที่สุดไปเก่าที่สุด (mtimeMs มากที่สุดไปน้อยที่สุด)
      fileStats.sort((a, b) => b.mtimeMs - a.mtimeMs);
      
      // ไฟล์ที่ใหม่ที่สุด (Index 0) คือไฟล์ที่จะถูกเก็บไว้
      const fileToKeep = fileStats[0];
      const filesToDelete = fileStats.slice(1); // ไฟล์ทั้งหมดหลังจาก Index 0 คือไฟล์เก่าที่ต้องลบ
      
      fileCleanupLogger.log(`Keeping file: ${fileToKeep.filename}. Preparing to delete ${filesToDelete.length} old files.`);
      
      // 5. วนลูปลบไฟล์เก่าทั้งหมด
      const deletionPromises = filesToDelete.map(async (file) => {
        try {
          await fs.unlink(file.fullPath);
          filesDeletedCount++;
        } catch (error: any) { 
          const errorMsg = `Failed to delete file ${file.filename}. Error: ${error.message}`;
          fileCleanupLogger.error(errorMsg);
          deletionErrors.push(errorMsg);
        }
      });
      
      // รอให้การลบไฟล์ทั้งหมดเสร็จสิ้น
      await Promise.all(deletionPromises);
      
      // 6. สรุปผลลัพธ์
      let finalMessage = `Cleanup completed. Successfully deleted ${filesDeletedCount} old file(s). 
        The latest file kept is: ${fileToKeep.filename}.`;
        
      if (deletionErrors.length > 0) {
        finalMessage = `Cleanup partially succeeded. Deleted ${filesDeletedCount} file(s) but failed to delete ${deletionErrors.length} file(s).`;
      }
      
      fileCleanupLogger.log(finalMessage);
      
      return {
        success: deletionErrors.length === 0,
        message: finalMessage,
        filesKept: 1,
        filesDeletedCount: filesDeletedCount,
        filesKeptNames: [fileToKeep.filename],
        deletionErrors: deletionErrors,
      };

    } catch (error: any) { 
      const errorMsg = `Fatal error during cleanup process. Error: ${error.message}`;
      fileCleanupLogger.error(errorMsg, error.stack);
      
      return {
        success: false,
        message: errorMsg,
        filesKept: 0,
        filesDeletedCount: 0,
        filesKeptNames: [],
        deletionErrors: [errorMsg],
      };
    }
  }
}
