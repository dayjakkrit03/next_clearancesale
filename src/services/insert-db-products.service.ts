// v.1.1.3 ==============================================================================
// src/services/insert-db-products.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { import_product_batches_status } from "@prisma/generated/interlink";

/* ===========================================================
 *  Types
 * ===========================================================
 */

/** 1 แถวจาก Excel ที่อ่านมาจาก batch (รองรับทุกคอลัมน์ใหม่) */
export interface ProductImportItem {
  product_id?: number | string | null;
  category_id?: number | string | null;
  sub_id?: number | string | null;
  part_id?: number | string | null;

  product_name?: string | null;
  product_brand?: string | null;
  product_description?: string | null;
  product_picture?: string | null;
  product_sku: string; // ใช้เป็น key หลัก
  product_file?: string | null;
  product_filename?: string | null;
  product_price?: number | string | null;
  product_new?: number | string | boolean | null;
  product_best?: number | string | boolean | null;
  product_status?: number | string | null;
  users_action?: number | string | null;
  created_at?: any; // *ตอนนี้ไม่ใช้ แต่เผื่อไว้
  updated_at?: any; // *ตอนนี้ไม่ใช้ แต่เผื่อไว้
  product_uom?: string | null;
  visible?: boolean | number | string | null;
  display_order?: number | string | null;

  ["9"]?: number | string | boolean | null;
  ["13"]?: number | string | boolean | null;

  // ใน template header คือ clearanceSales / clearanceQuantity / clearancePrice
  // แต่ read-excel แปลงเป็น lower-case หมด → clearancesales / clearancequantity / clearanceprice
  clearancesales?: number | string | boolean | null;
  clearancequantity?: number | string | null;
  clearanceprice?: number | string | null;

  expo_status?: number | string | null;
  expo_price?: number | string | null;
  cat5e?: number | string | boolean | null;
  cat6?: number | string | boolean | null;
  tool_tester?: number | string | boolean | null;
  image_url?: string | null;
  discount_label?: string | null;
  rating_score?: number | string | null;
  rating_count?: number | string | null;
  free_ship_eligible?: number | string | boolean | null;
  free_ship_minimum?: number | string | null;
  warranty_day?: string | number | null;
  return_days?: number | string | null;

  // สำหรับ product_conditions / discountpercentage_clearance_tb
  sales_type?: string | null;
  minimum_length?: string | number | null;
  cut_steps?: string | number | null;
  num_stock?: string | number | null;

  grade_type?: string | null;
  store_name?: string | null;
  num_qty?: string | number | null;
  price_sale?: string | number | null;
}

/** record ของ batch log */
type ImportProductBatch = NonNullable<
  Awaited<
    ReturnType<typeof prismaInterlink.import_product_batches.findFirst>
  >
>;

interface ProcessResult {
  success: boolean;
  batchId?: number;
  count: number;
  message: string;
  error_details?: string;
}

/* ===========================================================
 *  Helpers
 * ===========================================================
 */

function toInt(v: any, def: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
}

function toDecimal(v: any, def: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
}

function toBool(v: any, def = false): boolean {
  if (v === null || v === undefined) return def;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "y" || s === "yes";
}

function toStringOrNull(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** แปลง "1 YEAR", "6 MONTH", "15 DAY", "36" → จำนวนเดือน */
function parseWarrantyMonths(v: any): number | null {
  if (!v && v !== 0) return null;
  const s = String(v).trim().toUpperCase();

  const yearMatch = s.match(/(\d+)\s*YEAR/);
  if (yearMatch) return Number(yearMatch[1]) * 12;

  const monthMatch = s.match(/(\d+)\s*MONTH/);
  if (monthMatch) return Number(monthMatch[1]);

  const dayMatch = s.match(/(\d+)\s*DAY/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    if (!Number.isNaN(days)) {
      // สมมติ 1 เดือน ~ 30 วัน
      return Math.max(1, Math.ceil(days / 30));
    }
  }

  if (/^\d+$/.test(s)) return Number(s);
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

/** split string ด้วย ; แล้ว trim */
function splitList(v: any): string[] {
  const s = toStringOrNull(v);
  if (!s) return [];
  return s
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x !== "");
}

function formatDiscountLabel(v: any): string | null {
  const s = toStringOrNull(v);
  if (!s) return null;

  // ถ้ามี % อยู่แล้วก็ไม่ต้องแปลง
  if (s.includes("%")) return s;

  const n = Number(s);
  if (Number.isNaN(n)) {
    // แปลงไม่ได้ก็คืนค่าเดิม
    return s;
  }

  // ถ้าเป็นทศนิยม 0 < n <= 1 → ตีความว่าเป็น 0.7 = 70%
  if (n > 0 && n <= 1) {
    return `${Math.round(n * 100)}%`;
  }

  // กรณีเป็น 70, 80 ฯลฯ → แปลงเป็น 70%
  return `${Math.round(n)}%`;
}


/* ===========================================================
 *  MAIN SERVICE
 * ===========================================================
 */

export async function processLatestProductBatch(
  batchId?: number
): Promise<ProcessResult> {
  await setInterlinkSessionTZ();

  let batchLog: ImportProductBatch | null = null;
  let dataList: ProductImportItem[] = [];
  let transactionSuccess = false;

  const PENDING = import_product_batches_status.PENDING;
  const PROCESSING = import_product_batches_status.PROCESSING;
  const NEXT_STATUS = import_product_batches_status.FOLDERS_CREATING;
  const ERROR = import_product_batches_status.ERROR;

  try {
    // 1) หา batch (เหมือนโค้ดเดิม)
    if (batchId) {
      batchLog = await prismaInterlink.import_product_batches.findFirst({
        where: { id: BigInt(batchId), status: PENDING },
      });
    } else {
      batchLog = await prismaInterlink.import_product_batches.findFirst({
        where: { status: PENDING },
        orderBy: { id: "desc" },
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

    // 2) mark PROCESSING
    await prismaInterlink.import_product_batches.update({
      where: { id: batchLog.id },
      data: {
        status: PROCESSING,
        processed_at: new Date(),
        error_details: null,
      },
    });

    // 3) parse JSON
    const jsonString = batchLog.product_data;
    if (typeof jsonString === "string" && jsonString.length > 0) {
      dataList = JSON.parse(jsonString) as ProductImportItem[];
    }

    if (!Array.isArray(dataList) || dataList.length === 0) {
      await prismaInterlink.import_product_batches.update({
        where: { id: batchLog.id },
        data: {
          status: ERROR,
          processed_at: new Date(),
          error_details:
            "Product data in batch log is empty or invalid JSON array.",
        },
      });

      return {
        success: false,
        batchId: currentBatchId,
        count: 0,
        message: `Batch ID ${currentBatchId} failed. Data in batch log is invalid or empty.`,
        error_details: "Invalid data format in batch log.",
      };
    }

    // 4) lookup product_id ตาม product_sku (เหมือนโค้ดเดิม)
    const lookupPromises = dataList.map((item) =>
      prismaInterlink.products_clearance.findFirst({
        where: { product_sku: item.product_sku },
        select: { product_id: true },
      })
    );
    const existingProducts = await Promise.all(lookupPromises);

    /* -------------------------------------------------------
     * 5) Transaction หลัก
     *    - upsert products_clearance (logic เดิม)
     *    - จัดการ product_conditions / discountpercentage_clearance_tb
     * ----------------------------------------------------- */

    let processedCount = 0;

    const results = await prismaInterlink.$transaction(async (tx) => {
      const output: { product_id: number }[] = [];

      for (let index = 0; index < dataList.length; index++) {
        const raw = dataList[index];
        const existingId = existingProducts[index]?.product_id ?? null;

        const productSku = raw.product_sku;
        if (!productSku) continue;

        // ✅ ใช้วันเวลาปัจจุบันอย่างเดียว ไม่ดึงจาก template เลย
        const now = new Date();

        const warrantyMonths = parseWarrantyMonths(raw.warranty_day);
        const returnDays = toInt(raw.return_days, 0);

        // ---------- mapping Excel → products_clearance ----------
        const productBaseData = {
          category_id: toInt(raw.category_id, 0),
          sub_id: toInt(raw.sub_id, 0),
          part_id: toInt(raw.part_id, 0),

          product_name: toStringOrNull(raw.product_name) ?? "",
          product_brand: toStringOrNull(raw.product_brand) ?? "",
          product_description: toStringOrNull(raw.product_description),
          product_picture: toStringOrNull(raw.product_picture),
          product_file: toStringOrNull(raw.product_file),
          product_filename: toStringOrNull(raw.product_filename),
          product_price: toDecimal(raw.product_price) ?? null,

          product_new: toInt(raw.product_new, 0) ?? 0,
          product_best: toInt(raw.product_best, 0) ?? 0,
          product_status: toInt(raw.product_status, 1) ?? 1,
          users_action: toInt(raw.users_action ?? null),

          // ❌ ไม่ set created_at / updated_at → ให้ DB handle (default & on update)
          // created_at: now,
          // updated_at: now,

          product_uom: toStringOrNull(raw.product_uom),
          visible: toBool(raw.visible, true),
          display_order: toInt(raw.display_order, 0) ?? 0,

          clearanceSales: toBool(raw.clearancesales, false),
          clearanceQuantity: toInt(raw.clearancequantity, 0) ?? 0,
          clearancePrice: toDecimal(raw.clearanceprice),

          expo_status: toInt(raw.expo_status, 0) ?? 0,
          expo_price: toDecimal(raw.expo_price, 0) ?? 0,

          cat5e: toBool(raw.cat5e, false) ? 1 : 0,
          cat6: toBool(raw.cat6, false) ? 1 : 0,
          tool_tester: toBool(raw.tool_tester, false) ? 1 : 0,

          image_url:
            toStringOrNull(raw.image_url) ?? `/uploads/products/${productSku}`,

        //   discount_label: toStringOrNull(raw.discount_label),
          discount_label: formatDiscountLabel(raw.discount_label),
          rating_score: toDecimal(raw.rating_score),
          rating_count: toInt(raw.rating_count, 0) ?? 0,

          free_shipping_eligible: toBool(raw.free_ship_eligible, true),
          free_ship_minimum: toDecimal(raw.free_ship_minimum, 5000) ?? 5000,

          warranty_months: warrantyMonths ?? 36,
          return_days: returnDays ?? 7,
        };

        // ---------- upsert products_clearance (COPY logic เดิม) ----------
        let finalProductId: number;

        if (existingId) {
          const updated = await tx.products_clearance.update({
            where: { product_id: existingId },
            data: {
              ...productBaseData,
              product_sku: productSku,
              // updated_at: now, // ถ้าต้องการบังคับอัปเดตเอง ก็ใส่เพิ่มได้
            },
          });
          finalProductId = updated.product_id;
        } else {
          const created = await tx.products_clearance.create({
            data: {
              ...productBaseData,
              product_sku: productSku,
              // created_at จะให้ DB ใส่เอง
            },
          });
          finalProductId = created.product_id;
        }

        // ---------- product_conditions ----------
        const salesType =
          toStringOrNull(raw.sales_type)?.toUpperCase() ?? null;
        const unitsSystem = toStringOrNull(raw.product_uom);

        const minLenList = splitList(raw.minimum_length);
        const stockList = splitList(raw.num_stock);
        const cutStepList = splitList(raw.cut_steps);

        await tx.product_conditions.deleteMany({
          where: { pro_id: finalProductId },
        });

        const maxCond =
          Math.max(
            minLenList.length,
            stockList.length,
            cutStepList.length
          ) || (salesType ? 1 : 0);

        if (maxCond > 0) {
          const conditionRows = [];

          for (let i = 0; i < maxCond; i++) {
            conditionRows.push({
              pro_id: finalProductId,
              pro_sku: productSku,
              pro_brand: toStringOrNull(raw.product_brand),
              pro_details: toStringOrNull(raw.product_description),
              minimum_length: minLenList[i] ?? minLenList[0] ?? null,
              sales_type: salesType,
              units_system: unitsSystem,
              num_stock: stockList[i] ?? stockList[0] ?? null,
              cut_steps: cutStepList[i] ?? cutStepList[0] ?? null,
              created_at: now,
              updated_at: now,
            });
          }

          await tx.product_conditions.createMany({ data: conditionRows });
        }

        // ---------- discountpercentage_clearance_tb ----------
        const gradeList = splitList(raw.grade_type);
        const storeName = toStringOrNull(raw.store_name) ?? "";
        const qtyList = splitList(raw.num_qty);
        const priceList = splitList(raw.price_sale);

        await tx.discountpercentage_clearance_tb.deleteMany({
          where: { product_id: finalProductId },
        });

        const maxDisc = Math.max(
          gradeList.length,
          qtyList.length,
          priceList.length
        );

        if (maxDisc > 0) {
          const discountRows = [];

          for (let i = 0; i < maxDisc; i++) {
            const grade = gradeList[i] ?? gradeList[0] ?? null;
            if (!grade) continue;

            const qty = toInt(qtyList[i] ?? qtyList[0] ?? 0, 0) ?? 0;
            const price =
              toDecimal(
                priceList[i] ?? priceList[0] ?? raw.product_price,
                0
              ) ?? 0;

            discountRows.push({
              product_id: finalProductId,
              grade_name: grade,
              store_name: storeName,
              store_number: qty,
              product_price: price,
              create_date: now,
              update_date: now,
            });
          }

          await tx.discountpercentage_clearance_tb.createMany({
            data: discountRows,
          });
        }

        processedCount++;
        output.push({ product_id: finalProductId });
      }

      return output;
    });

    transactionSuccess = true;

    // 6) update สถานะ batch
    await prismaInterlink.import_product_batches.update({
      where: { id: batchLog.id },
      data: {
        status: NEXT_STATUS,
        processed_at: new Date(),
      },
    });

    return {
      success: true,
      batchId: Number(batchLog.id),
      count: processedCount,
      message: `${processedCount} products processed into products_clearance, product_conditions, and discountpercentage_clearance_tb (Batch ID: ${Number(
        batchLog.id
      )}). Status set to FOLDERS_CREATING.`,
    };
  } catch (error) {
    const errorDetails =
      error instanceof Error ? error.message : "Unknown database error.";
    const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;

    console.error(
      `Error processing Product Batch ID ${currentBatchId}:`,
      error
    );

    if (batchLog && !transactionSuccess) {
      try {
        await prismaInterlink.import_product_batches.update({
          where: { id: batchLog.id },
          data: {
            status: ERROR,
            processed_at: new Date(),
            error_details: `Database transaction failed during upsert logic: ${errorDetails}`,
          },
        });
      } catch (logError) {
        console.error(
          "Failed to update product batch status to ERROR:",
          logError
        );
      }
    }

    return {
      success: false,
      batchId: currentBatchId,
      count: 0,
      message: `Failed to process product import batch ID ${currentBatchId}.`,
      error_details: errorDetails,
    };
  }
}

// v.1.1.3 ==============================================================================

// v.1.1.2 ==============================================================================
// // src/services/insert-db-products.service.ts

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import { import_product_batches_status } from "@prisma/generated/interlink";

// /** ข้อมูล 1 แถวจาก Excel (หลัง read-excel) */
// export interface ProductImportItem {
//   product_id?: number | string | null;
//   category_id?: number | string | null;
//   sub_id?: number | string | null;
//   part_id?: number | string | null;

//   product_name?: string | null;
//   product_brand?: string | null;
//   product_description?: string | null;
//   product_picture?: string | null;
//   product_sku?: string | null;
//   product_file?: string | null;
//   product_filename?: string | null;
//   product_price?: number | string | null;
//   product_new?: number | string | boolean | null;
//   product_best?: number | string | boolean | null;
//   product_status?: number | string | null;
//   users_action?: number | string | null;
//   created_at?: any;
//   updated_at?: any;
//   product_uom?: string | null;
//   visible?: boolean | number | string | null;
//   display_order?: number | string | null;
//   ["9"]?: number | string | boolean | null;
//   ["13"]?: number | string | boolean | null;
//   clearancesales?: number | string | boolean | null;
//   clearancequantity?: number | string | null;
//   clearanceprice?: number | string | null;
//   expo_status?: number | string | null;
//   expo_price?: number | string | null;
//   cat5e?: number | string | boolean | null;
//   cat6?: number | string | boolean | null;
//   tool_tester?: number | string | boolean | null;
//   image_url?: string | null;
//   discount_label?: string | null;
//   rating_score?: number | string | null;
//   rating_count?: number | string | null;
//   free_ship_eligible?: number | string | boolean | null;
//   free_ship_minimum?: number | string | null;
//   warranty_day?: string | number | null;
//   return_days?: number | string | null;

//   // สำหรับ product_conditions / discountpercentage_clearance_tb
//   sales_type?: string | null;
//   minimum_length?: string | number | null; // เช่น "500;100;130;250"
//   cut_steps?: string | number | null;      // เช่น "0" หรือ "10;20"
//   num_stock?: string | number | null;      // เช่น "42;1;1;1"

//   grade_type?: string | null;              // เช่น "B;C;D"
//   store_name?: string | null;              // เช่น "12"
//   num_qty?: string | number | null;        // เช่น "13;25;10"
//   price_sale?: string | number | null;     // เช่น "220;300;190"
// }

// /** type ของ batch log record */
// type ImportProductBatch = NonNullable<
//   Awaited<
//     ReturnType<typeof prismaInterlink.import_product_batches.findFirst>
//   >
// >;

// interface ProcessResult {
//   success: boolean;
//   batchId?: number;
//   count: number;
//   message: string;
//   error_details?: string;
// }

// /* ---------- helper แปลงค่า basic ---------- */

// function toInt(v: any, def: number | null = null): number | null {
//   if (v === null || v === undefined || v === "") return def;
//   const n = Number(v);
//   return Number.isNaN(n) ? def : n;
// }

// function toDecimal(v: any, def: number | null = null): number | null {
//   if (v === null || v === undefined) return def;
//   if (v === "") return def;
//   const n = Number(v);
//   return Number.isNaN(n) ? def : n;
// }

// function toBool(v: any, def = false): boolean {
//   if (v === null || v === undefined) return def;
//   if (typeof v === "boolean") return v;
//   const s = String(v).trim().toLowerCase();
//   return s === "1" || s === "true" || s === "y" || s === "yes";
// }

// function toStringOrNull(v: any): string | null {
//   if (v === null || v === undefined) return null;
//   const s = String(v).trim();
//   return s === "" ? null : s;
// }

// function parseDate(v: any): Date | null {
//   if (!v) return null;
//   if (v instanceof Date) return v;
//   const d = new Date(v);
//   return Number.isNaN(d.getTime()) ? null : d;
// }

// /** แปลง "1 YEAR", "6 MONTH", "15 DAY", "36" → จำนวนเดือน (สำหรับ warranty_months) */
// function parseWarrantyMonths(v: any): number | null {
//   if (!v && v !== 0) return null;
//   const s = String(v).trim().toUpperCase();

//   // YEAR → เดือน
//   const yearMatch = s.match(/(\d+)\s*YEAR/);
//   if (yearMatch) return Number(yearMatch[1]) * 12;

//   // MONTH → เดือน
//   const monthMatch = s.match(/(\d+)\s*MONTH/);
//   if (monthMatch) return Number(monthMatch[1]);

//   // DAY → แปลงเป็นเดือนแบบปัดขึ้น (ceil)
//   const dayMatch = s.match(/(\d+)\s*DAY/);
//   if (dayMatch) {
//     const days = Number(dayMatch[1]);
//     if (!Number.isNaN(days)) {
//       return Math.max(1, Math.ceil(days / 30));
//     }
//   }

//   // ตัวเลขล้วน → ถือว่าเป็นจำนวนเดือน
//   if (/^\d+$/.test(s)) return Number(s);

//   const n = Number(s);
//   return Number.isNaN(n) ? null : n;
// }

// /** split string ด้วย ; แล้ว trim + filter ว่าง */
// function splitList(v: any): string[] {
//   const s = toStringOrNull(v);
//   if (!s) return [];
//   return s
//     .split(";")
//     .map((x) => x.trim())
//     .filter((x) => x !== "");
// }

// /* ===========================================================
//  *  MAIN SERVICE
//  * ===========================================================
//  */

// export async function processLatestProductBatch(
//   batchId?: number
// ): Promise<ProcessResult> {
//   await setInterlinkSessionTZ();

//   let batchLog: ImportProductBatch | null = null;
//   let dataList: ProductImportItem[] = [];
//   let transactionSuccess = false;

//   const PENDING = import_product_batches_status.PENDING;
//   const PROCESSING = import_product_batches_status.PROCESSING;
//   const NEXT_STATUS = import_product_batches_status.FOLDERS_CREATING;
//   const ERROR = import_product_batches_status.ERROR;

//   try {
//     // 1) หา batch
//     if (batchId) {
//       // ถ้าอยากบังคับให้เป็น PENDING จริง ๆ ใช้ findFirst จะปลอดภัยกว่า
//       batchLog = await prismaInterlink.import_product_batches.findFirst({
//         where: { id: BigInt(batchId), status: PENDING },
//       });
//     } else {
//       batchLog = await prismaInterlink.import_product_batches.findFirst({
//         where: { status: PENDING },
//         orderBy: { id: "desc" },
//       });
//     }

//     if (!batchLog) {
//       return {
//         success: false,
//         count: 0,
//         message: batchId
//           ? `Batch ID ${batchId} not found or is not PENDING.`
//           : "No PENDING product import batches found for processing.",
//       };
//     }

//     const currentBatchId = Number(batchLog.id);

//     // 2) set เป็น PROCESSING
//     await prismaInterlink.import_product_batches.update({
//       where: { id: batchLog.id },
//       data: {
//         status: PROCESSING,
//         processed_at: new Date(),
//         error_details: null,
//       },
//     });

//     // 3) parse JSON
//     const jsonString = batchLog.product_data;
//     if (typeof jsonString === "string" && jsonString.length > 0) {
//       dataList = JSON.parse(jsonString) as ProductImportItem[];
//     }

//     if (!Array.isArray(dataList) || dataList.length === 0) {
//       await prismaInterlink.import_product_batches.update({
//         where: { id: batchLog.id },
//         data: {
//           status: ERROR,
//           processed_at: new Date(),
//           error_details:
//             "Product data in batch log is empty or invalid JSON array.",
//         },
//       });

//       return {
//         success: false,
//         batchId: currentBatchId,
//         count: 0,
//         message: `Batch ID ${currentBatchId} failed. Data in batch log is invalid or empty.`,
//         error_details: "Invalid data format in batch log.",
//       };
//     }

//     /* -------------------------------------------------------
//      * 4) เตรียมข้อมูล: หา product_id ที่มีอยู่แล้ว (ตาม product_sku)
//      * ----------------------------------------------------- */

//     const lookupPromises = dataList.map((item) =>
//       prismaInterlink.products_clearance.findFirst({
//         where: { product_sku: toStringOrNull(item.product_sku) ?? "" },
//         select: { product_id: true },
//       })
//     );
//     const existingProducts = await Promise.all(lookupPromises);

//     /* -------------------------------------------------------
//      * 5) Transaction หลัก
//      *    - upsert products_clearance
//      *    - ลบ product_conditions / discountpercentage_clearance_tb เก่า
//      *    - สร้างใหม่จากข้อมูลใน Excel
//      * ----------------------------------------------------- */

//     let processedCount = 0;

//     await prismaInterlink.$transaction(async (tx) => {
//       for (let index = 0; index < dataList.length; index++) {
//         const raw = dataList[index];
//         const existing = existingProducts[index];

//         const productSku = toStringOrNull(raw.product_sku);
//         if (!productSku) {
//           continue; // ถ้าไม่มี SKU ข้าม
//         }

//         const excelProductId = toInt(raw.product_id);
//         const existingId = existing?.product_id ?? null; // ใช้สำหรับ UPDATE เท่านั้น

//         const createdAt = parseDate(raw.created_at) ?? new Date();
//         const updatedAt = parseDate(raw.updated_at) ?? createdAt;

//         const warrantyMonths = parseWarrantyMonths(raw.warranty_day);
//         const returnDays = toInt(raw.return_days, 0);

//         // ---------- mapping Excel → products_clearance (ตรงตาม Prisma schema) ----------
//         const productBaseData = {
//           category_id: toInt(raw.category_id, 0),
//           sub_id: toInt(raw.sub_id, 0),
//           part_id: toInt(raw.part_id, 0),

//           product_name: toStringOrNull(raw.product_name),
//           product_brand: toStringOrNull(raw.product_brand),
//           product_description: toStringOrNull(raw.product_description),
//           product_picture: toStringOrNull(raw.product_picture),
//           product_file: toStringOrNull(raw.product_file),
//           product_filename: toStringOrNull(raw.product_filename),
//           product_price: toDecimal(raw.product_price),

//           product_new: toInt(raw.product_new, 0) ?? 0,
//           product_best: toInt(raw.product_best, 0) ?? 0,
//           product_status: toInt(raw.product_status, 1) ?? 1,
//           users_action: toInt(raw.users_action ?? null),

//           created_at: createdAt,
//           updated_at: updatedAt,

//           product_uom: toStringOrNull(raw.product_uom),
//           visible: toBool(raw.visible, true),
//           display_order: toInt(raw.display_order, 0) ?? 0,

//           clearanceSales: toBool(raw.clearancesales, false),
//           clearanceQuantity: toInt(raw.clearancequantity, 0) ?? 0,
//           clearancePrice: toDecimal(raw.clearanceprice),

//           expo_status: toInt(raw.expo_status, 0) ?? 0,
//           expo_price: toDecimal(raw.expo_price, 0) ?? 0,

//           cat5e: toBool(raw.cat5e, false) ? 1 : 0,
//           cat6: toBool(raw.cat6, false) ? 1 : 0,
//           tool_tester: toBool(raw.tool_tester, false) ? 1 : 0,

//           image_url:
//             toStringOrNull(raw.image_url) ??
//             `/uploads/products/${productSku}`,

//           discount_label: toStringOrNull(raw.discount_label),
//           rating_score: toDecimal(raw.rating_score),
//           rating_count: toInt(raw.rating_count, 0) ?? 0,

//           free_shipping_eligible: toBool(raw.free_ship_eligible, true),
//           free_ship_minimum: toDecimal(raw.free_ship_minimum, 5000) ?? 5000,

//           warranty_months: warrantyMonths ?? 36,
//           return_days: returnDays ?? 7,
//         };

//         // ---------- upsert products_clearance ----------
//         let finalProductId: number;

//         if (existingId !== null) {
//           // UPDATE เฉพาะกรณีมี record จริงใน DB
//           const updatedProduct = await tx.products_clearance.update({
//             where: { product_id: existingId },
//             data: {
//               ...productBaseData,
//               product_sku: productSku,
//             },
//           });
//           finalProductId = updatedProduct.product_id;
//         } else {
//           // CREATE ใหม่
//           const createdProduct = await tx.products_clearance.create({
//             data: {
//               ...productBaseData,
//               product_sku: productSku,
//               ...(excelProductId ? { product_id: excelProductId } : {}),
//             },
//           });
//           finalProductId = createdProduct.product_id;
//         }

//         // ---------- product_conditions ----------
//         const salesType = toStringOrNull(raw.sales_type)?.toUpperCase() ?? null;
//         const unitsSystem = toStringOrNull(raw.product_uom);

//         const minLenList = splitList(raw.minimum_length);
//         const stockList = splitList(raw.num_stock);
//         const cutStepList = splitList(raw.cut_steps);

//         await tx.product_conditions.deleteMany({
//           where: { pro_id: finalProductId },
//         });

//         const maxCond =
//           Math.max(minLenList.length, stockList.length, cutStepList.length) ||
//           (salesType ? 1 : 0);

//         if (maxCond > 0) {
//           const conditionRows: any[] = [];

//           for (let i = 0; i < maxCond; i++) {
//             conditionRows.push({
//               pro_id: finalProductId,
//               pro_sku: productSku,
//               pro_brand: toStringOrNull(raw.product_brand),
//               pro_details: toStringOrNull(raw.product_description),
//               minimum_length: minLenList[i] ?? minLenList[0] ?? null,
//               sales_type: salesType,
//               units_system: unitsSystem,
//               num_stock: stockList[i] ?? stockList[0] ?? null,
//               cut_steps: cutStepList[i] ?? cutStepList[0] ?? null,
//               created_at: createdAt,
//               updated_at: updatedAt,
//             });
//           }

//           await tx.product_conditions.createMany({
//             data: conditionRows,
//           });
//         }

//         // ---------- discountpercentage_clearance_tb ----------
//         const gradeList = splitList(raw.grade_type);
//         const storeName = toStringOrNull(raw.store_name) ?? ""; // NOT NULL
//         const qtyList = splitList(raw.num_qty);
//         const priceList = splitList(raw.price_sale);

//         await tx.discountpercentage_clearance_tb.deleteMany({
//           where: { product_id: finalProductId },
//         });

//         const maxDisc = Math.max(
//           gradeList.length,
//           qtyList.length,
//           priceList.length
//         );

//         if (maxDisc > 0) {
//           const discountRows: any[] = [];

//           for (let i = 0; i < maxDisc; i++) {
//             const grade = gradeList[i] ?? gradeList[0] ?? null;
//             if (!grade) continue;

//             const qty = toInt(qtyList[i] ?? qtyList[0] ?? 0, 0) ?? 0;
//             const price =
//               toDecimal(
//                 priceList[i] ?? priceList[0] ?? raw.product_price,
//                 0
//               ) ?? 0;

//             discountRows.push({
//               product_id: finalProductId,
//               grade_name: grade,
//               store_name: storeName,
//               store_number: qty,
//               product_price: price,
//               create_date: createdAt,
//               update_date: updatedAt,
//             });
//           }

//           await tx.discountpercentage_clearance_tb.createMany({
//             data: discountRows,
//           });
//         }

//         processedCount++;
//       }
//     });

//     transactionSuccess = true;

//     // 6) update สถานะ batch
//     await prismaInterlink.import_product_batches.update({
//       where: { id: batchLog.id },
//       data: {
//         status: NEXT_STATUS,
//         processed_at: new Date(),
//       },
//     });

//     return {
//       success: true,
//       batchId: Number(batchLog.id),
//       count: processedCount,
//       message: `${processedCount} products processed into products_clearance, product_conditions, and discountpercentage_clearance_tb (Batch ID: ${Number(
//         batchLog.id
//       )}). Status set to FOLDERS_CREATING.`,
//     };
//   } catch (error) {
//     const errorDetails =
//       error instanceof Error ? error.message : "Unknown database error.";
//     const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;

//     console.error(`Error processing Product Batch ID ${currentBatchId}:`, error);

//     if (batchLog && !transactionSuccess) {
//       try {
//         await prismaInterlink.import_product_batches.update({
//           where: { id: batchLog.id },
//           data: {
//             status: ERROR,
//             processed_at: new Date(),
//             error_details: `Database transaction failed during upsert logic: ${errorDetails}`,
//           },
//         });
//       } catch (logError) {
//         console.error(
//           "Failed to update product batch status to ERROR:",
//           logError
//         );
//       }
//     }

//     return {
//       success: false,
//       batchId: currentBatchId,
//       count: 0,
//       message: `Failed to process product import batch ID ${currentBatchId}.`,
//       error_details: errorDetails,
//     };
//   }
// }


// v.1.1.2 ==============================================================================

// // src/services/insert-db-products.service.ts

// import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
// import { Prisma } from "@prisma/client";

// // 💡 สำคัญ: ใช้ Enum สำหรับ Product Batch Status
// import { import_product_batches_status } from "@prisma/generated/interlink"; 

// // 💡 กำหนด Type สำหรับ Product Log Record ที่ดึงมาจาก DB
// type ImportProductBatch = NonNullable<Awaited<ReturnType<typeof prismaInterlink.import_product_batches.findFirst>>>;

// // 💡 กำหนด Type สำหรับข้อมูลที่ผ่านการแปลงและตรวจสอบแล้ว (Input จาก Excel)
// export interface ProductImportItem {
//     product_sku: string; // ใช้เป็น Unique Key ในการ Upsert
//     product_name: string;
//     product_brand: string;
//     product_description?: string;
//     product_price: Prisma.Decimal;
//     product_uom?: string;
//     category_id?: number;
//     sub_id?: number;
//     part_id?: number;
//     visible: boolean;
//     display_order: number;
//     // ... ฟิลด์อื่น ๆ ที่จำเป็น
// }

// // 💡 กำหนด Type สำหรับ Return Value ของ Service
// interface ProcessResult {
//     success: boolean;
//     batchId?: number; 
//     count: number;
//     message: string;
//     error_details?: string;
// }

// /**
//  * 🎯 API: POST /api/import/products/insert-db
//  * 1. ดึง Batch Log ล่าสุดที่เป็น PENDING
//  * 2. เปลี่ยนสถานะ Batch Log เป็น PROCESSING ทันทีที่ล็อก
//  * 3. แปลง JSON data เป็น Array of Products
//  * 4. นำเข้าข้อมูล Product เข้าสู่ตาราง products_clearance ด้วย Upsert Logic (Find-Then-Update/Create)
//  * 5. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING เพื่อเตรียมเข้าสู่ขั้นตอนต่อไป (สร้างโฟลเดอร์)
//  * @param batchId - (Optional) ID ของ Batch ที่ต้องการประมวลผล หากไม่ระบุ จะหา Batch ล่าสุดที่เป็น PENDING
//  * @returns ผลลัพธ์การประมวลผล
//  */
// export async function processLatestProductBatch(batchId?: number): Promise<ProcessResult> {
//     // 1. ตั้งค่า Time Zone ก่อนทำธุรกรรม DB
//     await setInterlinkSessionTZ();

//     let batchLog: ImportProductBatch | null = null; 
//     let dataList: ProductImportItem[] = [];
//     let transactionSuccess = false;
    
//     // 💡 กำหนดสถานะตาม State Machine
//     const PENDING = import_product_batches_status.PENDING;
//     const PROCESSING = import_product_batches_status.PROCESSING; // สถานะใหม่เมื่อเริ่มประมวลผล
//     const NEXT_STATUS = import_product_batches_status.FOLDERS_CREATING; // สถานะถัดไปหลัง Upsert สำเร็จ
//     const ERROR = import_product_batches_status.ERROR;

//     try {
//         // --- 1. ค้นหา Batch Log ที่ต้องการประมวลผล (สถานะ PENDING เท่านั้น) ---
//         if (batchId) {
//             batchLog = await prismaInterlink.import_product_batches.findUnique({
//                 where: { id: BigInt(batchId), status: PENDING } 
//             });
//         } else {
//             // ค้นหา Batch ล่าสุดที่เป็น PENDING
//             batchLog = await prismaInterlink.import_product_batches.findFirst({
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
//                     : "No PENDING product import batches found for processing.",
//             };
//         }
        
//         const currentBatchId = Number(batchLog.id);

//         // --- 2. เปลี่ยนสถานะ Batch เป็น PROCESSING ทันทีที่ล็อกเพื่อป้องกันการประมวลผลซ้ำ ---
//         await prismaInterlink.import_product_batches.update({
//             where: { id: batchLog.id }, 
//             data: {
//                 status: PROCESSING, // 💡 เปลี่ยนสถานะเป็น PROCESSING
//                 processed_at: new Date(),
//                 error_details: null,
//             }
//         });

//         // --- 3. แปลง JSON String เป็น Array of Products ---
//         const jsonString = batchLog.product_data; 
//         if (typeof jsonString === 'string' && jsonString.length > 0) {
//             dataList = JSON.parse(jsonString) as ProductImportItem[];
//         }

//         if (!Array.isArray(dataList) || dataList.length === 0) {
//             // ถ้า Batch Log มีปัญหาเรื่องข้อมูล ให้จบกระบวนการนี้เป็น ERROR
//             await prismaInterlink.import_product_batches.update({
//                 where: { id: batchLog.id }, 
//                 data: {
//                     status: ERROR,
//                     processed_at: new Date(),
//                     error_details: 'Product data in batch log is empty or invalid JSON array.'
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

//         // --- 4. Find-Then-Create-or-Update Logic ---
        
//         // 4a. ค้นหา product_id ที่มีอยู่แล้วทั้งหมดตาม product_sku (Pre-Transaction Lookup)
//         const lookupPromises = dataList.map((item) => 
//             prismaInterlink.products_clearance.findFirst({
//                 where: { product_sku: item.product_sku }, // ใช้ findFirst ได้โดยใช้ฟิลด์ใดก็ได้
//                 select: { product_id: true }
//             })
//         );
//         const existingProducts = await Promise.all(lookupPromises);


//         // 4b. สร้าง Array ของ Operation (Update หรือ Create) สำหรับ Transaction
//         const transactionOperations = dataList.map((item, index) => {
//             const existingId = existingProducts[index]?.product_id;

//             const imageUrlPath = `/public/uploads/products/${item.product_sku}`;
            
//             // ข้อมูลสำหรับทั้ง Update และ Create
//             const baseData = {
//                 product_name: item.product_name,
//                 product_brand: item.product_brand,
//                 product_description: item.product_description,
//                 product_price: item.product_price,
//                 product_uom: item.product_uom,
//                 category_id: item.category_id,
//                 sub_id: item.sub_id,
//                 part_id: item.part_id,
//                 visible: item.visible,
//                 display_order: item.display_order,
//                 image_url: imageUrlPath,
//             };

//             if (existingId) {
//                 // UPDATE: ใช้ product_id ใน where clause เพื่อให้เป็น Type-Safe
//                 return prismaInterlink.products_clearance.update({
//                     where: { product_id: existingId }, // 💡 แก้ไข: ใช้ Primary Key ที่ค้นหาได้
//                     data: {
//                         ...baseData,
//                         updated_at: new Date(),
//                     }
//                 });
//             } else {
//                 // CREATE: 
//                 return prismaInterlink.products_clearance.create({
//                     data: {
//                         ...baseData,
//                         product_sku: item.product_sku, // ต้องเพิ่ม product_sku สำหรับ Create
//                     }
//                 });
//             }
//         });


//         // --- 5. รัน Transaction เพื่อนำเข้า/อัปเดตทั้งหมดพร้อมกัน ---
//         const results = await prismaInterlink.$transaction(transactionOperations);
//         transactionSuccess = true;

//         // --- 6. อัปเดตสถานะ Batch Log เป็น FOLDERS_CREATING ---
//         await prismaInterlink.import_product_batches.update({
//             where: { id: batchLog.id }, 
//             data: {
//                 status: NEXT_STATUS, // 💡 เปลี่ยนสถานะเป็น FOLDERS_CREATING เพื่อไปขั้นตอนต่อไป
//                 processed_at: new Date(),
//             }
//         });

//         return {
//             success: true,
//             batchId: currentBatchId,
//             count: results.length,
//             message: `${results.length} products successfully processed into products_clearance (Batch ID: ${currentBatchId}). Status set to FOLDERS_CREATING.`,
//         };

//     } catch (error) {
//         const errorDetails = error instanceof Error ? error.message : "Unknown database error.";
        
//         const currentBatchId = batchLog?.id ? Number(batchLog.id) : undefined;
        
//         console.error(`Error processing Product Batch ID ${currentBatchId}:`, error);

//         // --- 7. อัปเดตสถานะ Batch Log เป็น ERROR หากเกิดข้อผิดพลาด ---
//         if (batchLog && !transactionSuccess) {
//             try {
//                 await prismaInterlink.import_product_batches.update({
//                     where: { id: batchLog.id }, 
//                     data: {
//                         status: ERROR, // 💡 ใช้ ERROR Enum
//                         processed_at: new Date(),
//                         error_details: `Database transaction failed during upsert logic: ${errorDetails}`,
//                     }
//                 });
//             } catch (logError) {
//                 console.error("Failed to update product batch status to ERROR:", logError);
//             }
//         }
        
//         // ส่งผลลัพธ์การล้มเหลวกลับไป
//         return {
//             success: false,
//             batchId: currentBatchId,
//             count: 0,
//             message: `Failed to process product import batch ID ${currentBatchId}.`,
//             error_details: errorDetails,
//         };
//     }
// }