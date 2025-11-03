// v.1.1.4 ===================================================================


// v.1.1.4 ===================================================================


// v.1.1.3 ===================================================================
// src/services/file.service.ts

import path from 'path';
import { access, mkdir, constants, readFile, readdir } from 'fs/promises'; // 💡 เพิ่ม readdir
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import sharp from 'sharp'; // 💡 ต้องติดตั้ง: npm install sharp

// 💡 โครงสร้างสำหรับรับ Input ของ API: /create-folders
export interface FolderCreationRequest {
    items: FolderCreationItem[]; // Array ของ Category slug
}

// กำหนดโครงสร้างข้อมูลที่ API นี้จะรับเข้ามา (เป็นส่วนย่อยของ Request Body)
export interface FolderCreationItem {
  // ใช้ slug เพื่อสร้างชื่อโฟลเดอร์
  slug: string;
}

// 💡 โครงสร้างสำหรับรับ Input ของ API: /copy-images (ปรับปรุงใหม่ให้รับเฉพาะ slug)
export interface ImageProcessItem {
    slug: string; // Category slug ที่ต้องการ Scan ไฟล์ในโฟลเดอร์นี้
}

export interface ImageProcessRequest {
  items: ImageProcessItem[]; // Array ของ Category ที่ต้องการประมวลผล
}


// กำหนด Base Upload Path สำหรับ Local Project
const UPLOAD_ROOT_PATH = path.join(process.cwd(), 'public/uploads');

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


/**
 * สร้างโฟลเดอร์สำหรับ Category ใน 2 ตำแหน่ง:
 * ... (ฟังก์ชัน createCategoryFolders ไม่มีการเปลี่ยนแปลง)
 */
export async function createCategoryFolders(items: FolderCreationItem[]): Promise<{ count: number }> {
  let createdCount = 0;
  
  // 1. ดึงค่า Shared Path จาก DB
  const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
  
  if (!sharedGraphicPath) {
    // หากไม่พบค่าใน DB หรือ DB Error ให้โยน Error
    throw new Error('Shared graphic path is not configured in config_setting table (key: shared_graphic_path).');
  }

  // 2. กำหนด Path หลักสำหรับ Local และ Shared
  const LOCAL_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
  const SHARED_BASE_PATH = sharedGraphicPath; // ใช้ค่าที่ดึงมาจาก DB
  
  // 3. สร้างโฟลเดอร์หลัก /categories (Local) ก่อน
  try {
    await access(LOCAL_BASE_PATH);
  } catch (error) {
    await mkdir(LOCAL_BASE_PATH, { recursive: true });
    console.log(`Created base path (Local): ${LOCAL_BASE_PATH}`);
  }
  
  // 4. สร้างโฟลเดอร์หลัก /categories_images (Shared) ก่อน (ถ้ายังไม่มี)
  try {
    await access(SHARED_BASE_PATH);
  } catch (error) {
    await mkdir(SHARED_BASE_PATH, { recursive: true });
    console.log(`Created base path (Shared): ${SHARED_BASE_PATH}`);
  }


  // 5. วนลูปสร้างโฟลเดอร์ย่อยสำหรับแต่ละ Category ในทั้งสองตำแหน่ง
  for (const item of items) {
    const localDestinationPath = path.join(LOCAL_BASE_PATH, item.slug);
    const sharedDestinationPath = path.join(SHARED_BASE_PATH, item.slug);

    // ฟังก์ชันย่อยสำหรับสร้างโฟลเดอร์
    const createFolder = async (folderPath: string, location: 'Local' | 'Shared') => {
      try {
        await mkdir(folderPath, { recursive: true });
        createdCount++;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          console.error(`Error creating folder for ${item.slug} (${location}):`, error);
        }
      }
    };

    // รันพร้อมกัน
    await Promise.all([
      createFolder(localDestinationPath, 'Local'),
      createFolder(sharedDestinationPath, 'Shared')
    ]);
  }

  return { count: createdCount };
}


/**
 * 🎯 ฟังก์ชันหลัก: Scan โฟลเดอร์ Shared Drive, แปลงเป็น WEBP และ Upsert ข้อมูล
 * @param request ข้อมูลที่มีรายการ Category slug ที่ต้องการประมวลผล
 * @returns Promise ที่ส่งคืนจำนวนรูปภาพที่ประมวลผลสำเร็จและ Upsert ลง DB
 */
export async function copyCategoryImages(request: ImageProcessRequest): Promise<{ count: number }> {
  const { items } = request;
  let processedCount = 0;
  let allImagesToProcess: { slug: string, filename: string, display_order: number }[] = [];
  
  await setInterlinkSessionTZ();

  // 1. ดึง Shared Path จาก DB
  const sharedGraphicPath = await getConfigSetting('shared_graphic_path');
  if (!sharedGraphicPath) {
    throw new Error('Shared graphic path is not configured. Cannot proceed with image scanning and copying.');
  }
  const CATEGORY_BASE_PATH = path.join(UPLOAD_ROOT_PATH, 'categories');
  
  // 2. วนลูปเพื่อ Scan ไฟล์ในแต่ละ Category โฟลเดอร์
  for (const item of items) {
    const sharedFolder = path.join(sharedGraphicPath, item.slug);
    
    try {
        // ตรวจสอบและอ่านรายชื่อไฟล์ในโฟลเดอร์ Shared Drive
        const filenames = await readdir(sharedFolder);
        
        // กรองเฉพาะไฟล์รูปภาพ (JPG, JPEG, PNG, GIF)
        const imageFiles = filenames
            .filter(name => /\.(jpe?g|png|gif)$/i.test(name))
            .sort(); // เรียงตามชื่อไฟล์เพื่อกำหนด display_order
        
        // รวบรวมข้อมูลไฟล์ที่จะประมวลผล
        imageFiles.forEach((filename, index) => {
            allImagesToProcess.push({
                slug: item.slug,
                filename: filename,
                display_order: index, // ให้ลำดับตามการเรียงชื่อไฟล์
            });
        });

    } catch (error) {
        // หากโฟลเดอร์ของ Category นี้ไม่มีใน Shared Drive หรือมีปัญหาในการเข้าถึง
        console.warn(`Warning: Could not access shared folder for slug: ${item.slug}. Skipping file scan. Error:`, (error as Error).message);
    }
  }

    // ถ้าไม่มีรูปภาพให้ประมวลผลเลย
    if (allImagesToProcess.length === 0) {
        return { count: 0 };
    }

  // 3. ดึง Category ID ทั้งหมดที่เกี่ยวข้อง (จากรายการที่พบไฟล์)
  const slugsWithImages = [...new Set(allImagesToProcess.map(i => i.slug))];
  const categories = await prismaInterlink.ui_categories.findMany({
    where: { slug: { in: slugsWithImages } },
    select: { id: true, slug: true },
  });
  const categoryIdMap = new Map(categories.map(c => [c.slug, c.id]));


  // 4. วนลูปประมวลผลรูปภาพทีละรายการ (Read, Convert, Write, Upsert DB)
  for (const item of allImagesToProcess) {
    const categoryId = categoryIdMap.get(item.slug);
    if (!categoryId) {
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
      await sharp(imageBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดสูงสุด 1200x1200
          .webp({ quality: 80 }) // แปลงเป็น WebP คุณภาพ 80%
          .toFile(destinationFilePath);
      
      // b) Upsert ข้อมูลลง DB
      // 1. ค้นหารายการที่มีอยู่
      const existingImage = await prismaInterlink.images_categories.findFirst({
            where: {
                category_id: categoryId,
                image_name: webpFilename,
            },
        });

      if (existingImage) {
        // 2. อัปเดตถ้ามีอยู่แล้ว
        await prismaInterlink.images_categories.update({
            where: { id: existingImage.id }, // ใช้ Unique ID ในการ Update
            data: {
                display_order: item.display_order,
                visible: true, 
            },
        });
      } else {
        // 3. สร้างใหม่ถ้ายังไม่มี
        await prismaInterlink.images_categories.create({
            data: {
                category_id: categoryId,
                image_name: webpFilename,
                display_order: item.display_order,
                visible: true, 
            },
        });
      }
      
      processedCount++;
      
    } catch (error) {
      console.warn(`Warning: Failed to process, save image, or update DB for ${item.slug}/${item.filename}. Error:`, error);
    }
  }

  return { count: processedCount };
}
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