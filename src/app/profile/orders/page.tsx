// v.1.1.3 ======================================================
// // src/app/profile/orders/page.tsx

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, prismaInterlink } from "@/lib/db";
// import { getProductImageUrl } from "@/lib/image-path";

// import OrdersClient, {
//   OrderItem,
//   OrderSalesLine,
// } from "./OrdersClient";

// /* ===================== PAGE ===================== */

// export default async function OrdersPage() {
//   /* ===================== AUTH ===================== */

//   const cookieStore = await cookies();
//   const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

//   if (!token) redirect("/login");

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) redirect("/login");

//   const customerId = Number(payload.sub);

//   /* ===================== QUERY INV ===================== */

//   const invList = await prismaShop.inv.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       inv_status: true,
//       event_sale: "clearance-2025",
//     },
//     orderBy: { id: "desc" },
//   });

//   /* ===================== ENRICH + MAP ===================== */

//   const allOrders: OrderItem[] = [];

//   for (const inv of invList) {
//     let rawLines: any[] = [];

//     try {
//       rawLines = inv.data_sales_line
//         ? JSON.parse(inv.data_sales_line)
//         : [];
//     } catch {
//       rawLines = [];
//     }

//     const salesLines: OrderSalesLine[] = [];

//     for (const line of rawLines) {
//       let imageUrl: string | null = null;

//       try {
//         const product = await prismaInterlink.products_clearance.findFirst({
//           where: {
//             product_sku: line.item_NoField,
//           },
//           select: {
//             product_id: true,
//           },
//         });

//         if (product?.product_id) {
//           imageUrl = await getProductImageUrl(product.product_id);
//         }
//       } catch {
//         imageUrl = null;
//       }

//       salesLines.push({
//         sku: line.item_NoField,
//         quantity: Number(line.quantityField || 0),
//         unit: line.unit_of_Measure_CodeField,
//         price: Number(line.unit_PriceField || 0),
//         amount: Number(line.amountField || 0),
//         imageUrl,
//       });
//     }

//     allOrders.push({
//       id: Number(inv.id),
//       inv: inv.inv,
//       ref_inv: inv.ref_inv,
//       reserve: inv.reserve,
//       updated_at: inv.updated_at
//         ? inv.updated_at.toISOString().replace("T", " ").slice(0, 19)
//         : "",
//       lead_time: inv.lead_time,
//       salesLines,
//     });
//   }

//   /* ===================== SPLIT ===================== */

//   const orders = allOrders.filter((o) => o.reserve === false);
//   const reserves = allOrders.filter((o) => o.reserve === true);

//   /* ===================== RENDER ===================== */

//   return (
//     <OrdersClient
//       orders={orders}
//       reserves={reserves}
//     />
//   );
// }

// v.1.1.3 ======================================================

// v.1.1.2 ======================================================
// src/app/profile/orders/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, prismaInterlink } from "@/lib/db";
import { getProductImageUrl } from "@/lib/image-path";

import OrdersClient from "./OrdersClient";

/** shape ของ sales line หลัง enrich แล้ว */
export type EnrichedSalesLine = {
  item_NoField: string;
  quantityField: number;
  unit_of_Measure_CodeField: string;
  unit_PriceField: number;
  amountField: number;
  imageUrl?: string | null;
};

export type EnrichedInv = {
  id: bigint;
  inv?: string | null;
  ref_inv?: string | null;
  reserve: boolean;
  updated_at?: Date | null;
  lead_time?: string | null;
  salesLines: EnrichedSalesLine[];
};

export default async function OrdersPage() {
  /* ===================== AUTH ===================== */

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) redirect("/login");

  const payload = verifyAuthToken(token);
  if (!payload?.sub) redirect("/login");

  const customerId = Number(payload.sub);

  /* ===================== QUERY INV ===================== */

  const invList = await prismaShop.inv.findMany({
    where: {
      id__customers: BigInt(customerId),
      inv_status: true,
      event_sale: "clearance-2025",
    },
    orderBy: { id: "desc" },
  });

  /* ===================== ENRICH DATA ===================== */

  const enriched: EnrichedInv[] = [];

  for (const inv of invList) {
    let lines: any[] = [];

    try {
      lines = inv.data_sales_line
        ? JSON.parse(inv.data_sales_line)
        : [];
    } catch {
      lines = [];
    }

    const enrichedLines: EnrichedSalesLine[] = [];

    for (const line of lines) {
      let imageUrl: string | null = null;

      try {
        // 🔑 map SKU -> product_id
        const product = await prismaInterlink.products_clearance.findFirst({
          where: {
            product_sku: line.item_NoField,
          },
          select: {
            product_id: true,
          },
        });

        if (product?.product_id) {
          imageUrl = await getProductImageUrl(product.product_id);
        }
      } catch {
        imageUrl = null;
      }

      enrichedLines.push({
        item_NoField: line.item_NoField,
        quantityField: Number(line.quantityField),
        unit_of_Measure_CodeField: line.unit_of_Measure_CodeField,
        unit_PriceField: Number(line.unit_PriceField),
        amountField: Number(line.amountField),
        imageUrl,
      });
    }

    enriched.push({
      id: inv.id,
      inv: inv.inv,
      ref_inv: inv.ref_inv,
      reserve: inv.reserve,
      updated_at: inv.updated_at,
      lead_time: inv.lead_time,
      salesLines: enrichedLines,
    });
  }

  /* ===================== SPLIT MODE ===================== */

  const orders = enriched.filter((x) => x.reserve === false);
  const reserves = enriched.filter((x) => x.reserve === true);

  /* ===================== RENDER ===================== */

  return (
    <OrdersClient
      orders={orders}
      reserves={reserves}
    />
  );
}

// v.1.1.2 ======================================================

// // src/app/profile/orders/page.tsx

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop } from "@/lib/db";

// import OrdersClient from "./OrdersClient";

// /**
//  * หน้า Order History (Profile)
//  * - Server Component
//  * - ตรวจ auth จาก cookie
//  * - ดึงข้อมูล inv เหมือน Laravel:
//  *   - inv_status = 1
//  *   - reserve = false => ประวัติการสั่งซื้อ
//  *   - reserve = true  => ประวัติการสั่งจอง
//  */
// export default async function OrdersPage() {
//   /* ===================== AUTH ===================== */

// const cookieStore = await cookies();
// const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
//   if (!token) {
//     redirect("/login");
//   }

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) {
//     redirect("/login");
//   }

//   const customerId = Number(payload.sub);

//   /* ===================== QUERY ===================== */

//   const invList = await prismaShop.inv.findMany({
//     where: {
//       id__customers: BigInt(customerId),
//       inv_status: true, // = 1 เหมือน Laravel
//       event_sale: "clearance-2025",
//     },
//     orderBy: {
//       id: "desc",
//     },
//   });

//   // แยก purchase / reserve เหมือน controller เดิม
//   const orders = invList.filter((x) => x.reserve === false);
//   const reserves = invList.filter((x) => x.reserve === true);

//   /* ===================== RENDER ===================== */

//   return (
//     <OrdersClient
//       orders={orders}
//       reserves={reserves}
//     />
//   );
// }
