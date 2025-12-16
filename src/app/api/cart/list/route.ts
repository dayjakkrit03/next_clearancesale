// v.1.1.7 =============================================
// src/app/api/cart/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import {
  prismaShop,
  prismaInterlink,
  setShopSessionTZ,
  setInterlinkSessionTZ,
} from "@/lib/db";
import {
  CURRENT_EVENT_SALE,
  mapCartRowToCartItem,
} from "@/services/cart/cart.helpers";
import type { CartItem } from "@/types/cart";
import { getProductImageUrl } from "@/lib/image-path";

type CartItemWithProduct = CartItem & {
  productId?: number | null; // ✅ เพิ่มบรรทัดนี้
  productName?: string | null;
  productImageUrl?: string | null;
  productUom?: string | null;

  productBrand?: string | null;
  productCategoryId?: number | null;
  productOriginalPrice?: number | null;
  productDiscountLabel?: string | null;
  productClearanceSales?: boolean | null;
  productClearanceQuantity?: number | null;
  productFreeShippingEligible?: boolean | null;
  productFreeShipMinimum?: number | null;
  productWarrantyMonths?: number | null;
  productReturnDays?: number | null;

  /** 🔹 เงื่อนไขการขาย (CUT / ROLL / etc.) ที่เตรียมไว้ให้ฝั่ง UI ใช้ */
  productConditions?: any[] | null;
};

export async function GET(req: NextRequest) {
  try {
    // ---------- reserve param ----------
    const url = new URL(req.url);
    const reserveParam = url.searchParams.get("reserve");

    let reserve: 0 | 1 = 0;
    if (
      reserveParam === "reserve" ||
      reserveParam === "1" ||
      reserveParam === "true"
    ) {
      reserve = 1;
    }

    // ---------- auth ----------
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

    let customerId: number | null = null;
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) customerId = Number(decoded.sub);
    }

    if (!customerId) {
      return NextResponse.json({ status: "login" }, { status: 200 });
    }

    // ---------- carts ----------
    await setShopSessionTZ();

    const rows = await prismaShop.carts.findMany({
      where: {
        id__customers: BigInt(customerId),
        cart_status: 0,
        reserve,
        event_sale: CURRENT_EVENT_SALE as any,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          status: "ok",
          items: [] as CartItemWithProduct[],
          checkAll: false,
          reserve,
          summary: {
            totalQuantity: 0,
            totalAmount: 0,
          },
        },
        { status: 200 },
      );
    }

    // ---------- products ----------
    const skus = Array.from(new Set(rows.map((r) => String(r.product))));

    await setInterlinkSessionTZ();

    const products = await prismaInterlink.products_clearance.findMany({
      where: {
        product_sku: { in: skus },
      },
      select: {
        product_id: true,
        product_sku: true,
        product_name: true,
        product_uom: true,
        product_brand: true,
        product_price: true,
        discount_label: true,
        category_id: true,
        clearanceSales: true,
        clearanceQuantity: true,
        free_shipping_eligible: true,
        free_ship_minimum: true,
        warranty_months: true,
        return_days: true,
      },
    });

    // ---------- conditions (product_conditions) ----------

    // helper แปลง string "2000;3000;4000" -> [2000, 3000, 4000]
    const parseNumberList = (raw?: string | null): number[] => {
      if (!raw) return [];
      return String(raw)
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n));
    };

    const productIdKeys = products
      .map((p) => p.product_id)
      .filter((id): id is number => id != null);

    const productConditionsRows =
      productIdKeys.length > 0
        ? await prismaInterlink.product_conditions.findMany({
            where: {
              pro_id: { in: productIdKeys }, // ✅ ใช้ pro_id ตาม prisma model
            },
          })
        : [];

    // map: pro_id -> conditions[]
    const conditionsByProductId = new Map<string, any[]>();

    for (const cond of productConditionsRows) {
      if (cond.pro_id == null) continue;
      const key = String(cond.pro_id);

      const lengths = parseNumberList(cond.minimum_length);
      const stocks = parseNumberList(cond.num_stock);
      const steps = parseNumberList(cond.cut_steps);
      const unit = cond.units_system ?? "M.";

      let converted: any;

      if ((cond.sales_type ?? "").toUpperCase() === "ROLL") {
        // ROLL: minimum_length = "2000;3000;4000", num_stock = "24;12;30"
        const rollPairs = lengths.map((len, idx) => ({
          length: len,
          stock: stocks[idx] ?? null,
        }));

        converted = {
          type: "ROLL",
          unit,
          rollPairs, // [{ length, stock }, ...]
          raw: cond,
        };
      } else {
        // CUT: minimum_length = "100", cut_steps = "10;30;60;100"
        converted = {
          type: "CUT",
          unit,
          minimumLength: lengths[0] ?? null,
          stepOptions: steps, // [10,30,60,100]
          raw: cond,
        };
      }

      if (!conditionsByProductId.has(key)) {
        conditionsByProductId.set(key, []);
      }
      conditionsByProductId.get(key)!.push(converted);
    }

    const productBySku = new Map<
      string,
      {
        productId: number | null; // ✅ เพิ่ม
        name: string | null;
        uom: string | null;
        brand: string | null;
        categoryId: number | null;
        originalPrice: number | null;
        discountLabel: string | null;
        clearanceSales: boolean | null;
        clearanceQuantity: number | null;
        freeShippingEligible: boolean | null;
        freeShipMinimum: number | null;
        warrantyMonths: number | null;
        returnDays: number | null;
        imageUrl: string | null;
        conditions: any[] | null;
      }
    >();

    for (const p of products) {
      const pidNumber = Number(p.product_id);
      const pidKey = String(p.product_id);
      const imageUrl = await getProductImageUrl(pidNumber);

      const categoryId =
        p.category_id != null ? Number(p.category_id) : null;

      const conditionsForProduct =
        pidKey && conditionsByProductId.has(pidKey)
          ? conditionsByProductId.get(pidKey)!
          : null;

      productBySku.set(String(p.product_sku), {
        productId: Number.isFinite(pidNumber) ? pidNumber : null, // ✅ เพิ่ม
        name: p.product_name ?? null,
        uom: p.product_uom ?? null,
        brand: p.product_brand ?? null,
        categoryId,
        originalPrice:
          p.product_price != null ? Number(p.product_price) : null,
        discountLabel: p.discount_label ?? null,
        clearanceSales: p.clearanceSales ?? null,
        clearanceQuantity:
          p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
        freeShippingEligible: p.free_shipping_eligible ?? null,
        freeShipMinimum:
          p.free_ship_minimum != null
            ? Number(p.free_ship_minimum)
            : null,
        warrantyMonths:
          p.warranty_months != null ? Number(p.warranty_months) : null,
        returnDays:
          p.return_days != null ? Number(p.return_days) : null,
        imageUrl: imageUrl ?? null,
        conditions: conditionsForProduct,
      });

      console.log("[cart/list] helper image path:", {
        sku: p.product_sku,
        product_id: pidNumber,
        imageUrl,
      });
    }

    // ---------- map rows + products ----------
    const items: CartItemWithProduct[] = rows.map((row) => {
      const base = mapCartRowToCartItem(row as any);
      const extra = productBySku.get(String(row.product));

      return {
        ...base,
        productId: extra?.productId ?? null, // ✅ เพิ่ม
        productName: extra?.name ?? null,
        productImageUrl: extra?.imageUrl ?? null,
        productUom: extra?.uom ?? null,
        productBrand: extra?.brand ?? null,
        productCategoryId: extra?.categoryId ?? null,
        productOriginalPrice: extra?.originalPrice ?? null,
        productDiscountLabel: extra?.discountLabel ?? null,
        productClearanceSales: extra?.clearanceSales ?? null,
        productClearanceQuantity: extra?.clearanceQuantity ?? null,
        productFreeShippingEligible: extra?.freeShippingEligible ?? null,
        productFreeShipMinimum: extra?.freeShipMinimum ?? null,
        productWarrantyMonths: extra?.warrantyMonths ?? null,
        productReturnDays: extra?.returnDays ?? null,
        // 🔹 ส่ง conditions ไปให้ use-shopping-cart-panel
        productConditions: extra?.conditions ?? null,
      };
    });

    const checkAll =
      items.length > 0 && items.every((item) => item.check_product === true);

    // ---------- summary ----------
    // ✅ จำนวน "รายการ" = จำนวนแถวในตะกร้า (ไม่ใช่ sum(quantity))
    const totalQuantity = items.length;

    // ✅ ยอดรวมราคาทั้งหมด
    const totalAmount = items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.price_amount ??
            Number(item.price) * Number(item.quantity),
        ),
      0,
    );

    return NextResponse.json(
      {
        status: "ok",
        items,
        checkAll,
        reserve,
        summary: {
          totalQuantity,
          totalAmount,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[api/cart/list] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 },
    );
  }
}

// v.1.1.7 =============================================

// v.1.1.6 =============================================
// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import { getProductImageUrl } from "@/lib/image-path";

// type CartItemWithProduct = CartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export async function GET(req: NextRequest) {
//   try {
//     // ---------- reserve param ----------
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ---------- auth ----------
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) customerId = Number(decoded.sub);
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     // ---------- carts ----------
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     if (rows.length === 0) {
//       return NextResponse.json(
//         {
//           status: "ok",
//           items: [] as CartItemWithProduct[],
//           checkAll: false,
//           reserve,
//           summary: {
//             totalQuantity: 0,
//             totalAmount: 0,
//           },
//         },
//         { status: 200 },
//       );
//     }

//     // ---------- products ----------
//     const skus = Array.from(new Set(rows.map((r) => String(r.product))));

//     await setInterlinkSessionTZ();

//     const products = await prismaInterlink.products_clearance.findMany({
//       where: {
//         product_sku: { in: skus },
//       },
//       select: {
//         product_id: true,
//         product_sku: true,
//         product_name: true,
//         product_uom: true,
//         product_brand: true,
//         product_price: true,
//         discount_label: true,
//         category_id: true,
//         clearanceSales: true,
//         clearanceQuantity: true,
//         free_shipping_eligible: true,
//         free_ship_minimum: true,
//         warranty_months: true,
//         return_days: true,
//       },
//     });

//     const productBySku = new Map<
//       string,
//       {
//         name: string | null;
//         uom: string | null;
//         brand: string | null;
//         categoryId: number | null;
//         originalPrice: number | null;
//         discountLabel: string | null;
//         clearanceSales: boolean | null;
//         clearanceQuantity: number | null;
//         freeShippingEligible: boolean | null;
//         freeShipMinimum: number | null;
//         warrantyMonths: number | null;
//         returnDays: number | null;
//         imageUrl: string | null;
//       }
//     >();

//     for (const p of products) {
//       const pid = Number(p.product_id);
//       const imageUrl = await getProductImageUrl(pid);

//       const categoryId =
//         p.category_id != null ? Number(p.category_id) : null;

//       productBySku.set(String(p.product_sku), {
//         name: p.product_name ?? null,
//         uom: p.product_uom ?? null,
//         brand: p.product_brand ?? null,
//         categoryId,
//         originalPrice:
//           p.product_price != null ? Number(p.product_price) : null,
//         discountLabel: p.discount_label ?? null,
//         clearanceSales: p.clearanceSales ?? null,
//         clearanceQuantity:
//           p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
//         freeShippingEligible: p.free_shipping_eligible ?? null,
//         freeShipMinimum:
//           p.free_ship_minimum != null
//             ? Number(p.free_ship_minimum)
//             : null,
//         warrantyMonths:
//           p.warranty_months != null ? Number(p.warranty_months) : null,
//         returnDays:
//           p.return_days != null ? Number(p.return_days) : null,
//         imageUrl: imageUrl ?? null,
//       });

//       console.log("[cart/list] helper image path:", {
//         sku: p.product_sku,
//         product_id: pid,
//         imageUrl,
//       });
//     }

//     // ---------- map rows + products ----------
//     const items: CartItemWithProduct[] = rows.map((row) => {
//       const base = mapCartRowToCartItem(row as any);
//       const extra = productBySku.get(String(row.product));

//       return {
//         ...base,
//         productName: extra?.name ?? null,
//         productImageUrl: extra?.imageUrl ?? null,
//         productUom: extra?.uom ?? null,
//         productBrand: extra?.brand ?? null,
//         productCategoryId: extra?.categoryId ?? null,
//         productOriginalPrice: extra?.originalPrice ?? null,
//         productDiscountLabel: extra?.discountLabel ?? null,
//         productClearanceSales: extra?.clearanceSales ?? null,
//         productClearanceQuantity: extra?.clearanceQuantity ?? null,
//         productFreeShippingEligible: extra?.freeShippingEligible ?? null,
//         productFreeShipMinimum: extra?.freeShipMinimum ?? null,
//         productWarrantyMonths: extra?.warrantyMonths ?? null,
//         productReturnDays: extra?.returnDays ?? null,
//       };
//     });

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     // ---------- summary ----------
//     // ✅ จำนวน "รายการ" = จำนวนแถวในตะกร้า (ไม่ใช่ sum(quantity))
//     const totalQuantity = items.length;

//     // ✅ ยอดรวมราคาทั้งหมด
//     const totalAmount = items.reduce(
//       (sum, item) =>
//         sum +
//         Number(
//           item.price_amount ??
//             Number(item.price) * Number(item.quantity),
//         ),
//       0,
//     );

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//         summary: {
//           totalQuantity,
//           totalAmount,
//         },
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 },
//     );
//   }
// }

// v.1.1.6 =============================================

// v.1.1.5 =============================================
// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import { getProductImageUrl } from "@/lib/image-path";

// type CartItemWithProduct = CartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export async function GET(req: NextRequest) {
//   try {
//     // ---------- reserve param ----------
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ---------- auth ----------
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) customerId = Number(decoded.sub);
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     // ---------- carts ----------
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     if (rows.length === 0) {
//       return NextResponse.json(
//         {
//           status: "ok",
//           items: [] as CartItemWithProduct[],
//           checkAll: false,
//           reserve,
//           summary: {
//             totalQuantity: 0,
//             totalAmount: 0,
//           },
//         },
//         { status: 200 }
//       );
//     }

//     // ---------- products ----------
//     const skus = Array.from(new Set(rows.map((r) => String(r.product))));

//     await setInterlinkSessionTZ();

//     const products = await prismaInterlink.products_clearance.findMany({
//       where: {
//         product_sku: { in: skus },
//       },
//       select: {
//         product_id: true,
//         product_sku: true,
//         product_name: true,
//         product_uom: true,
//         product_brand: true,
//         product_price: true,
//         discount_label: true,
//         category_id: true,
//         clearanceSales: true,
//         clearanceQuantity: true,
//         free_shipping_eligible: true,
//         free_ship_minimum: true,
//         warranty_months: true,
//         return_days: true,
//       },
//     });

//     const productBySku = new Map<
//       string,
//       {
//         name: string | null;
//         uom: string | null;
//         brand: string | null;
//         categoryId: number | null;
//         originalPrice: number | null;
//         discountLabel: string | null;
//         clearanceSales: boolean | null;
//         clearanceQuantity: number | null;
//         freeShippingEligible: boolean | null;
//         freeShipMinimum: number | null;
//         warrantyMonths: number | null;
//         returnDays: number | null;
//         imageUrl: string | null;
//       }
//     >();

//     for (const p of products) {
//       const pid = Number(p.product_id);
//       const imageUrl = await getProductImageUrl(pid);

//       const categoryId =
//         p.category_id != null ? Number(p.category_id) : null;

//       productBySku.set(String(p.product_sku), {
//         name: p.product_name ?? null,
//         uom: p.product_uom ?? null,
//         brand: p.product_brand ?? null,
//         categoryId,
//         originalPrice:
//           p.product_price != null ? Number(p.product_price) : null,
//         discountLabel: p.discount_label ?? null,
//         clearanceSales: p.clearanceSales ?? null,
//         clearanceQuantity:
//           p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
//         freeShippingEligible: p.free_shipping_eligible ?? null,
//         freeShipMinimum:
//           p.free_ship_minimum != null
//             ? Number(p.free_ship_minimum)
//             : null,
//         warrantyMonths:
//           p.warranty_months != null ? Number(p.warranty_months) : null,
//         returnDays:
//           p.return_days != null ? Number(p.return_days) : null,
//         imageUrl: imageUrl ?? null,
//       });

//       console.log("[cart/list] helper image path:", {
//         sku: p.product_sku,
//         product_id: pid,
//         imageUrl,
//       });
//     }

//     // ---------- map rows + products ----------
//     const items: CartItemWithProduct[] = rows.map((row) => {
//       const base = mapCartRowToCartItem(row as any);
//       const extra = productBySku.get(String(row.product));

//       return {
//         ...base,
//         productName: extra?.name ?? null,
//         productImageUrl: extra?.imageUrl ?? null,
//         productUom: extra?.uom ?? null,
//         productBrand: extra?.brand ?? null,
//         productCategoryId: extra?.categoryId ?? null,
//         productOriginalPrice: extra?.originalPrice ?? null,
//         productDiscountLabel: extra?.discountLabel ?? null,
//         productClearanceSales: extra?.clearanceSales ?? null,
//         productClearanceQuantity: extra?.clearanceQuantity ?? null,
//         productFreeShippingEligible: extra?.freeShippingEligible ?? null,
//         productFreeShipMinimum: extra?.freeShipMinimum ?? null,
//         productWarrantyMonths: extra?.warrantyMonths ?? null,
//         productReturnDays: extra?.returnDays ?? null,
//       };
//     });

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     // ---------- summary ----------
//     const totalQuantity = items.reduce(
//       (sum, item) => sum + Number(item.quantity ?? 0),
//       0
//     );

//     const totalAmount = items.reduce(
//       (sum, item) =>
//         sum +
//         Number(
//           item.price_amount ??
//             Number(item.price) * Number(item.quantity)
//         ),
//       0
//     );

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//         summary: {
//           totalQuantity,
//           totalAmount,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.5 =============================================

// v.1.1.4 =============================================
// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import { getProductImageUrl } from "@/lib/image-path"; // 👈 ใช้ helper กลางตัวเดียว

// /** ข้อมูล cart item + ข้อมูลสินค้าเพิ่ม (ชื่อ / รูป / หน่วย / ราคา / ส่วนลด / ฯลฯ) */
// type CartItemWithProduct = CartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export async function GET(req: NextRequest) {
//   try {
//     // ---------- reserve param ----------
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ---------- auth ----------
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) customerId = Number(decoded.sub);
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     // ---------- carts ----------
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     if (rows.length === 0) {
//       return NextResponse.json(
//         {
//           status: "ok",
//           items: [] as CartItemWithProduct[],
//           checkAll: false,
//           reserve,
//         },
//         { status: 200 },
//       );
//     }

//     // ---------- products (เอา product_id, sku, name, uom + ฟิลด์อื่น ๆ) ----------
//     const skus = Array.from(new Set(rows.map((r) => String(r.product))));

//     await setInterlinkSessionTZ();

//     const products = await prismaInterlink.products_clearance.findMany({
//       where: {
//         product_sku: { in: skus },
//       },
//       select: {
//         product_id: true,
//         product_sku: true,
//         product_name: true,
//         product_uom: true,
//         product_brand: true,
//         product_price: true,
//         discount_label: true,
//         category_id: true,
//         clearanceSales: true,
//         clearanceQuantity: true,
//         free_shipping_eligible: true,
//         free_ship_minimum: true,
//         warranty_months: true,
//         return_days: true,
//       },
//     });

//     // map sku → ข้อมูลสินค้า (ชื่อ / หน่วย / รูป / ราคา ฯลฯ)
//     const productBySku = new Map<
//       string,
//       {
//         name: string | null;
//         uom: string | null;
//         brand: string | null;
//         categoryId: number | null;
//         originalPrice: number | null;
//         discountLabel: string | null;
//         clearanceSales: boolean | null;
//         clearanceQuantity: number | null;
//         freeShippingEligible: boolean | null;
//         freeShipMinimum: number | null;
//         warrantyMonths: number | null;
//         returnDays: number | null;
//         imageUrl: string | null;
//       }
//     >();

//     for (const p of products) {
//       const pid = Number(p.product_id);
//       const imageUrl = await getProductImageUrl(pid); // 👈 ใช้ helper กลาง

//       const categoryId =
//         p.category_id != null ? Number(p.category_id) : null;

//       productBySku.set(String(p.product_sku), {
//         name: p.product_name ?? null,
//         uom: p.product_uom ?? null,
//         brand: p.product_brand ?? null,
//         categoryId,
//         originalPrice:
//           p.product_price != null ? Number(p.product_price) : null,
//         discountLabel: p.discount_label ?? null,
//         clearanceSales: p.clearanceSales ?? null,
//         clearanceQuantity:
//           p.clearanceQuantity != null ? Number(p.clearanceQuantity) : null,
//         freeShippingEligible: p.free_shipping_eligible ?? null,
//         freeShipMinimum:
//           p.free_ship_minimum != null
//             ? Number(p.free_ship_minimum)
//             : null,
//         warrantyMonths:
//           p.warranty_months != null ? Number(p.warranty_months) : null,
//         returnDays:
//           p.return_days != null ? Number(p.return_days) : null,
//         imageUrl: imageUrl ?? null,
//       });

//       console.log("[cart/list] helper image path:", {
//         sku: p.product_sku,
//         product_id: pid,
//         imageUrl,
//       });
//     }

//     // ---------- map เป็น CartItemWithProduct ----------
//     const items: CartItemWithProduct[] = rows.map((row) => {
//       const base = mapCartRowToCartItem(row as any);
//       const extra = productBySku.get(String(row.product));

//       return {
//         ...base,
//         productName: extra?.name ?? null,
//         productImageUrl: extra?.imageUrl ?? null,
//         productUom: extra?.uom ?? null,

//         productBrand: extra?.brand ?? null,
//         productCategoryId: extra?.categoryId ?? null,
//         productOriginalPrice: extra?.originalPrice ?? null,
//         productDiscountLabel: extra?.discountLabel ?? null,
//         productClearanceSales: extra?.clearanceSales ?? null,
//         productClearanceQuantity: extra?.clearanceQuantity ?? null,
//         productFreeShippingEligible: extra?.freeShippingEligible ?? null,
//         productFreeShipMinimum: extra?.freeShipMinimum ?? null,
//         productWarrantyMonths: extra?.warrantyMonths ?? null,
//         productReturnDays: extra?.returnDays ?? null,
//       };
//     });

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 },
//     );
//   }
// }

// v.1.1.4 =============================================


// v.1.1.3 =============================================
// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import { getProductImageUrl } from "@/lib/image-path"; // 👈 ใช้ helper กลางตัวเดียว

// /** ข้อมูล cart item + ข้อมูลสินค้าเพิ่ม (ชื่อ / รูป / หน่วย) */
// type CartItemWithProduct = CartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;
// };

// export async function GET(req: NextRequest) {
//   try {
//     // ---------- reserve param ----------
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ---------- auth ----------
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) customerId = Number(decoded.sub);
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     // ---------- carts ----------
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     if (rows.length === 0) {
//       return NextResponse.json(
//         {
//           status: "ok",
//           items: [] as CartItemWithProduct[],
//           checkAll: false,
//           reserve,
//         },
//         { status: 200 },
//       );
//     }

//     // ---------- products (เอา product_id, sku, name, uom) ----------
//     const skus = Array.from(new Set(rows.map((r) => String(r.product))));

//     await setInterlinkSessionTZ();

//     const products = await prismaInterlink.products_clearance.findMany({
//       where: {
//         product_sku: { in: skus },
//       },
//       select: {
//         product_id: true,
//         product_sku: true,
//         product_name: true,
//         product_uom: true,
//       },
//     });

//     // map sku → ข้อมูลสินค้า (ชื่อ / หน่วย / รูป จาก helper กลาง)
//     const productBySku = new Map<
//       string,
//       { name: string | null; uom: string | null; imageUrl: string | null }
//     >();

//     for (const p of products) {
//       const pid = Number(p.product_id);

//       // 👇 จุดสำคัญ: ใช้ helper กลางล้วน ๆ
//       const imageUrl = await getProductImageUrl(pid);

//       console.log("[cart/list] helper image path:", {
//         sku: p.product_sku,
//         product_id: pid,
//         imageUrl,
//       });

//       productBySku.set(String(p.product_sku), {
//         name: p.product_name ?? null,
//         uom: p.product_uom ?? null,
//         imageUrl: imageUrl ?? null,
//       });
//     }

//     // ---------- map เป็น CartItemWithProduct ----------
//     const items: CartItemWithProduct[] = rows.map((row) => {
//       const base = mapCartRowToCartItem(row as any);
//       const extra = productBySku.get(String(row.product));

//       return {
//         ...base,
//         productName: extra?.name ?? null,
//         productImageUrl: extra?.imageUrl ?? null, // 👈 ส่ง path จาก helper ไป UI ตรง ๆ
//         productUom: extra?.uom ?? null,
//       };
//     });

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 },
//     );
//   }
// }


// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import {
//   prismaShop,
//   prismaInterlink,
//   setShopSessionTZ,
//   setInterlinkSessionTZ,
// } from "@/lib/db";
// import {
//   CURRENT_EVENT_SALE,
//   mapCartRowToCartItem,
// } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";
// import { getProductImageUrl } from "@/lib/image-path-helper";

// /** ข้อมูล cart item + ข้อมูลสินค้าเพิ่ม (ชื่อ / รูป / หน่วย) */
// type CartItemWithProduct = CartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;
// };

// export async function GET(req: NextRequest) {
//   try {
//     // ============================
//     //   อ่าน reserve จาก query
//     // ============================
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     // รองรับหลายรูปแบบ:
//     //   - ไม่ส่ง        → reserve = 0
//     //   - "reserve"     → reserve = 1  (แนว Laravel เดิม)
//     //   - "1"/"true"    → reserve = 1
//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ============================
//     //   ตรวจสอบ JWT จาก cookie
//     // ============================
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) {
//         customerId = Number(decoded.sub);
//       }
//     }

//     if (!customerId) {
//       // ทำเหมือนฝั่ง add: ส่งสถานะ "login" ให้ frontend ไป redirect เอง
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     // ============================
//     //   ดึงข้อมูลจาก carts
//     // ============================
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     if (rows.length === 0) {
//       return NextResponse.json(
//         {
//           status: "ok",
//           items: [] as CartItemWithProduct[],
//           checkAll: false,
//           reserve,
//         },
//         { status: 200 }
//       );
//     }

//     // ============================
//     //   ดึงข้อมูลสินค้า + รูปภาพ
//     // ============================
//     // SKU ทั้งหมดในตะกร้า
//     const skus = Array.from(
//       new Set(rows.map((r) => String(r.product)))
//     );

//     // ดึงจาก interlink.products_clearance
//     await setInterlinkSessionTZ();
//     const products = await prismaInterlink.products_clearance.findMany({
//       where: {
//         product_sku: { in: skus },
//       },
//       select: {
//         product_id: true,
//         product_sku: true,
//         product_name: true,
//         product_uom: true,
//       },
//     });

//     const productIds = products
//       .map((p) => Number(p.product_id))
//       .filter((id) => Number.isFinite(id));

//     // ดึงรูปจาก images_products (เอารูปแรกที่ display_order น้อยสุดต่อ product_id)
//     let firstImageByProductId = new Map<number, string>();
//     if (productIds.length > 0) {
//       const images = await prismaInterlink.images_products.findMany({
//         where: {
//           product_id: { in: productIds.map((id) => BigInt(id)) },
//           visible: true,
//         },
//         orderBy: {
//           display_order: "asc",
//         },
//       });

//       for (const img of images) {
//         const pid = Number(img.product_id);
//         if (!firstImageByProductId.has(pid)) {
//           firstImageByProductId.set(pid, img.image_name);
//         }
//       }
//     }

//     // map sku → ข้อมูลสินค้า (ชื่อ / หน่วย / รูป)
//     const productBySku = new Map<
//       string,
//       { name: string | null; uom: string | null; imageUrl: string | null }
//     >();

//     for (const p of products) {
//       const pid = Number(p.product_id);
//       const filename = firstImageByProductId.get(pid);
//       let imageUrl: string | null = null;

//       if (filename) {
//         imageUrl = getProductImageUrl(p.product_sku, filename);
//       }

//       productBySku.set(String(p.product_sku), {
//         name: p.product_name ?? null,
//         uom: p.product_uom ?? null,
//         imageUrl,
//       });
//     }

//     // ============================
//     //   map เป็น CartItemWithProduct
//     // ============================
//     const items: CartItemWithProduct[] = rows.map((row) => {
//       const base = mapCartRowToCartItem(row as any);
//       const extra = productBySku.get(String(row.product));

//       return {
//         ...base,
//         productName: extra?.name ?? null,
//         productImageUrl: extra?.imageUrl ?? null,
//         productUom: extra?.uom ?? null,
//       };
//     });

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }

// v.1.1.2 =============================================

// // src/app/api/cart/list/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { CURRENT_EVENT_SALE, mapCartRowToCartItem } from "@/services/cart/cart.helpers";
// import type { CartItem } from "@/types/cart";

// export async function GET(req: NextRequest) {
//   try {
//     // ============================
//     //   อ่าน reserve จาก query
//     // ============================
//     const url = new URL(req.url);
//     const reserveParam = url.searchParams.get("reserve");

//     // รองรับหลายรูปแบบ:
//     //   - ไม่ส่ง    → reserve = 0
//     //   - "reserve" → reserve = 1  (แนว Laravel เดิม)
//     //   - "1"/"true" → reserve = 1
//     let reserve: 0 | 1 = 0;
//     if (
//       reserveParam === "reserve" ||
//       reserveParam === "1" ||
//       reserveParam === "true"
//     ) {
//       reserve = 1;
//     }

//     // ============================
//     //   ตรวจสอบ JWT จาก cookie
//     // ============================
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) {
//         customerId = Number(decoded.sub);
//       }
//     }

//     if (!customerId) {
//       // ทำเหมือนฝั่ง add: ส่งสถานะ "login" ให้ frontend ไป redirect เอง
//       return NextResponse.json(
//         { status: "login" },
//         { status: 200 }
//       );
//     }

//     // ============================
//     //   ดึงข้อมูลจาก carts
//     // ============================
//     await setShopSessionTZ();

//     const rows = await prismaShop.carts.findMany({
//       where: {
//         id__customers: BigInt(customerId),
//         cart_status: 0,
//         reserve,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       orderBy: {
//         id: "asc",
//       },
//     });

//     const items: CartItem[] = rows.map((row) =>
//       mapCartRowToCartItem(row as any)
//     );

//     const checkAll =
//       items.length > 0 && items.every((item) => item.check_product === true);

//     return NextResponse.json(
//       {
//         status: "ok",
//         items,
//         checkAll,
//         reserve,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[api/cart/list] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }
