// v.1.1.3 ===============================================================
// src/services/stock/stock.service.ts
import { prismaInterlink } from "@/lib/db";

type StockCheckItem = {
  sku: string;
  uom: string;        // "M." หรืออย่างอื่น
  quantity: number;   // จำนวน ROLL (หรือจำนวนหน่วย)
  total?: number;     // เมตรรวม (ใช้เฉพาะ uom = "M.")
};

type StockCheckError = {
  sku: string;
  reason:
    | "NAVISION_STOCK_NOT_ENOUGH"
    | "NAVISION_INVALID_RESPONSE"
    | "ROLL_STOCK_NOT_ENOUGH";
  meta?: any;
};

/** ✅ เพิ่ม type สำหรับ UI */
type InsufficientItem = {
  sku: string;
  uom: string;
  requested: number;
  available: number;
};

type StockCheckResult = {
  ok: boolean;
  errors: StockCheckError[];
  insufficientItems?: InsufficientItem[]; // ✅ เพิ่ม
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000"
  );
}

export class StockService {
  static async checkCartStock(
    items: StockCheckItem[],
  ): Promise<StockCheckResult> {
    console.log("========== STOCK CHECK START ==========");
    console.log("[STOCK] items:", items);

    const errors: StockCheckError[] = [];
    const insufficientItems: InsufficientItem[] = [];

    for (const item of items) {
      const sku = item.sku;
      const uom = item.uom;
      const qty = Number(item.quantity ?? 0);

      console.log("[STOCK] checking:", item);

      /* =========================
       * CASE 1: ไม่ใช่ M. → Navision อย่างเดียว
       * ========================= */
      if (uom !== "M.") {
        const nav = await this.checkNavision(sku, uom, qty);
        if (!nav.ok) {
          errors.push(nav.error!);
          insufficientItems.push({
            sku,
            uom,
            requested: qty,
            available: Number(nav.error?.meta?.have ?? 0),
          });
        }
        continue;
      }

      /* =========================
       * CASE 2: uom = M.
       * ========================= */

      const totalMeter = Number(item.total ?? 0);

      if (!totalMeter || qty <= 0) {
        errors.push({
          sku,
          reason: "ROLL_STOCK_NOT_ENOUGH",
          meta: { message: "invalid total/quantity" },
        });
        insufficientItems.push({
          sku,
          uom,
          requested: totalMeter,
          available: 0,
        });
        continue;
      }

      // 🔑 สูตรสำคัญ
      const selectedLength = totalMeter / qty;

      console.log("[STOCK][ROLL] derived length:", {
        sku,
        totalMeter,
        qty,
        selectedLength,
      });

      const hasCondition =
        await prismaInterlink.product_conditions.findFirst({
          where: { pro_sku: sku },
          select: { id: true },
        });

      // ❌ ไม่มีเงื่อนไข ROLL → fallback Navision (เช็คเป็นเมตร)
      if (!hasCondition) {
        const nav = await this.checkNavision(sku, "M.", totalMeter);
        if (!nav.ok) {
          errors.push(nav.error!);
          insufficientItems.push({
            sku,
            uom: "M.",
            requested: totalMeter,
            available: Number(nav.error?.meta?.have ?? 0),
          });
        }
        continue;
      }

      // ✅ มี ROLL → map ความยาวไปที่ minimum_length
      const row =
        await prismaInterlink.product_conditions.findFirst({
          where: {
            pro_sku: sku,
            minimum_length: String(selectedLength),
          },
          select: {
            minimum_length: true,
            num_stock: true,
          },
        });

      const rollStock = Number(row?.num_stock ?? 0);

      console.log("[STOCK][ROLL] result:", {
        sku,
        length: selectedLength,
        rollStock,
        needRoll: qty,
      });

      if (rollStock < qty) {
        errors.push({
          sku,
          reason: "ROLL_STOCK_NOT_ENOUGH",
          meta: {
            length: selectedLength,
            haveRoll: rollStock,
            needRoll: qty,
          },
        });

        insufficientItems.push({
          sku,
          uom,
          requested: qty,
          available: rollStock,
        });
      }
    }

    const result: StockCheckResult = {
      ok: errors.length === 0,
      errors,
      insufficientItems: errors.length ? insufficientItems : [],
    };

    console.log("[STOCK] FINAL RESULT:", result);
    console.log("========== STOCK CHECK END ==========");

    return result;
  }

  /* =========================
   * Navision check
   * ========================= */
  private static async checkNavision(
    sku: string,
    uom: string,
    needQty: number,
  ): Promise<{ ok: true } | { ok: false; error: StockCheckError }> {
    try {
      const url = `${getBaseUrl()}/api/legacy/navision/stock?sku=${encodeURIComponent(
        sku,
      )}&uom=${encodeURIComponent(uom)}`;

      console.log("[STOCK][NAV] request:", url);

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      console.log("[STOCK][NAV] response:", data);

      if (!data?.isNumeric) {
        return {
          ok: false,
          error: {
            sku,
            reason: "NAVISION_INVALID_RESPONSE",
            meta: data,
          },
        };
      }

      if (Number(data.quantity) < needQty) {
        return {
          ok: false,
          error: {
            sku,
            reason: "NAVISION_STOCK_NOT_ENOUGH",
            meta: { uom, need: needQty, have: data.quantity },
          },
        };
      }

      return { ok: true };
    } catch (err) {
      console.error("[STOCK][NAV] error:", err);
      return {
        ok: false,
        error: {
          sku,
          reason: "NAVISION_INVALID_RESPONSE",
        },
      };
    }
  }
}

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/services/stock/stock.service.ts

// import { prismaInterlink } from "@/lib/db";

// type StockCheckItem = {
//   sku: string;
//   uom: string;        // "M." หรืออย่างอื่น
//   quantity: number;   // จำนวน ROLL (หรือจำนวนหน่วย)
//   total?: number;     // เมตรรวม (ใช้เฉพาะ uom = "M.")
// };

// type StockCheckError = {
//   sku: string;
//   reason:
//     | "NAVISION_STOCK_NOT_ENOUGH"
//     | "NAVISION_INVALID_RESPONSE"
//     | "ROLL_STOCK_NOT_ENOUGH";
//   meta?: any;
// };

// type StockCheckResult = {
//   ok: boolean;
//   errors: StockCheckError[];
// };

// function getBaseUrl() {
//   return (
//     process.env.NEXT_PUBLIC_BASE_URL ||
//     process.env.BASE_URL ||
//     "http://localhost:3000"
//   );
// }

// export class StockService {
//   static async checkCartStock(
//     items: StockCheckItem[],
//   ): Promise<StockCheckResult> {
//     console.log("========== STOCK CHECK START ==========");
//     console.log("[STOCK] items:", items);

//     const errors: StockCheckError[] = [];

//     for (const item of items) {
//       const sku = item.sku;
//       const uom = item.uom;
//       const qty = Number(item.quantity ?? 0);

//       console.log("[STOCK] checking:", item);

//       /* =========================
//        * CASE 1: ไม่ใช่ M. → Navision อย่างเดียว
//        * ========================= */
//       if (uom !== "M.") {
//         const nav = await this.checkNavision(sku, uom, qty);
//         if (!nav.ok) errors.push(nav.error!);
//         continue;
//       }

//       /* =========================
//        * CASE 2: uom = M.
//        * ========================= */

//       const totalMeter = Number(item.total ?? 0);

//       if (!totalMeter || qty <= 0) {
//         errors.push({
//           sku,
//           reason: "ROLL_STOCK_NOT_ENOUGH",
//           meta: { message: "invalid total/quantity" },
//         });
//         continue;
//       }

//       // 🔑 สูตรสำคัญ (ที่คุณบอก)
//       const selectedLength = totalMeter / qty;

//       console.log("[STOCK][ROLL] derived length:", {
//         sku,
//         totalMeter,
//         qty,
//         selectedLength,
//       });

//       // ดูว่ามี product_conditions ไหม
//       const hasCondition =
//         await prismaInterlink.product_conditions.findFirst({
//           where: { pro_sku: sku },
//           select: { id: true },
//         });

//       // ❌ ไม่มีเงื่อนไข ROLL → fallback Navision (เช็คเป็นเมตร)
//       if (!hasCondition) {
//         const nav = await this.checkNavision(sku, "M.", totalMeter);
//         if (!nav.ok) errors.push(nav.error!);
//         continue;
//       }

//       // ✅ มี ROLL → map ความยาวไปที่ minimum_length
//       const row =
//         await prismaInterlink.product_conditions.findFirst({
//           where: {
//             pro_sku: sku,
//             minimum_length: String(selectedLength),
//           },
//           select: {
//             minimum_length: true,
//             num_stock: true,
//           },
//         });

//       const rollStock = Number(row?.num_stock ?? 0);

//       console.log("[STOCK][ROLL] result:", {
//         sku,
//         length: selectedLength,
//         rollStock,
//         needRoll: qty,
//       });

//       if (rollStock < qty) {
//         errors.push({
//           sku,
//           reason: "ROLL_STOCK_NOT_ENOUGH",
//           meta: {
//             length: selectedLength,
//             haveRoll: rollStock,
//             needRoll: qty,
//           },
//         });
//       }
//     }

//     const result: StockCheckResult = {
//       ok: errors.length === 0,
//       errors,
//     };

//     console.log("[STOCK] FINAL RESULT:", result);
//     console.log("========== STOCK CHECK END ==========");

//     return result;
//   }

//   /* =========================
//    * Navision check
//    * ========================= */
//   private static async checkNavision(
//     sku: string,
//     uom: string,
//     needQty: number,
//   ): Promise<{ ok: true } | { ok: false; error: StockCheckError }> {
//     try {
//       const url = `${getBaseUrl()}/api/legacy/navision/stock?sku=${encodeURIComponent(
//         sku,
//       )}&uom=${encodeURIComponent(uom)}`;

//       console.log("[STOCK][NAV] request:", url);

//       const res = await fetch(url, { cache: "no-store" });
//       const data = await res.json();

//       console.log("[STOCK][NAV] response:", data);

//       if (!data?.isNumeric) {
//         return {
//           ok: false,
//           error: {
//             sku,
//             reason: "NAVISION_INVALID_RESPONSE",
//             meta: data,
//           },
//         };
//       }

//       if (Number(data.quantity) < needQty) {
//         return {
//           ok: false,
//           error: {
//             sku,
//             reason: "NAVISION_STOCK_NOT_ENOUGH",
//             meta: { uom, need: needQty, have: data.quantity },
//           },
//         };
//       }

//       return { ok: true };
//     } catch (err) {
//       console.error("[STOCK][NAV] error:", err);
//       return {
//         ok: false,
//         error: {
//           sku,
//           reason: "NAVISION_INVALID_RESPONSE",
//         },
//       };
//     }
//   }
// }

// v.1.1.2 ===============================================================

// // src/services/stock/stock.service.ts

// import {
//   prismaInterlink,
//   setInterlinkSessionTZ,
// } from "@/lib/db";

// import type { CartItem } from "@/types/cart";

// /* ================================
//  * Types
//  * ================================ */

// type StockCheckError = {
//   sku: string;
//   reason: "ROLL_STOCK_NOT_ENOUGH" | "NAVISION_STOCK_NOT_ENOUGH";
// };

// export type StockCheckResult = {
//   ok: boolean;
//   errors: StockCheckError[];
// };

// /* ================================
//  * Helpers
//  * ================================ */

// async function checkNavisionStock(sku: string) {
//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

//   const res = await fetch(
//     `${baseUrl}/api/legacy/navision/stock?sku=${encodeURIComponent(
//       sku,
//     )}&uom=M.`,
//     { cache: "no-store" },
//   );

//   const data = await res.json();

//   return {
//     quantity: Number(data.quantity ?? 0),
//     isNumeric: Boolean(data.isNumeric),
//   };
// }

// async function checkRollStock(sku: string) {
//   await setInterlinkSessionTZ();

//   const row = await prismaInterlink.product_conditions.findFirst({
//     where: { pro_sku: sku },
//     select: { num_stock: true },
//   });

//   return Number(row?.num_stock ?? 0); // จำนวน Roll ที่เหลือ
// }

// /* ================================
//  * Service
//  * ================================ */

// export class StockService {
//   /**
//    * เช็ค stock 2 ชั้น
//    * - ROLL/CUT → เช็ค roll stock จาก product_conditions
//    * - ทุกกรณี → เช็ค stock กลางจาก Navision
//    */
//   static async checkCartStock(
//     items: (CartItem & { salesType: "ROLL" | "CUT" })[],
//   ): Promise<StockCheckResult> {
//     const errors: StockCheckError[] = [];

//     for (const item of items) {
//       const sku = item.product;

//       // 1) เช็ค Roll stock (เฉพาะ ROLL)
//       if (item.salesType === "ROLL") {
//         const rollStock = await checkRollStock(sku);
//         if (item.quantity > rollStock) {
//           errors.push({
//             sku,
//             reason: "ROLL_STOCK_NOT_ENOUGH",
//           });
//           continue;
//         }
//       }

//       // 2) เช็ค Stock กลาง (Navision)
//       const nav = await checkNavisionStock(sku);
//       if (!nav.isNumeric || item.quantity > nav.quantity) {
//         errors.push({
//           sku,
//           reason: "NAVISION_STOCK_NOT_ENOUGH",
//         });
//       }
//     }

//     return {
//       ok: errors.length === 0,
//       errors,
//     };
//   }
// }
