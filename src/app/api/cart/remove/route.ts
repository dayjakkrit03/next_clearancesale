// v.1.1.2 =============================================
// src/app/api/cart/remove/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";
import { getCartSummary } from "@/services/cart/cart.service";

type RemoveRequestBody = {
  id: number;
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

    let customerId: number | null = null;
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) customerId = Number(decoded.sub);
    }

    if (!customerId) {
      return NextResponse.json({ status: "login" }, { status: 200 });
    }

    const body = (await req.json()) as RemoveRequestBody | null;
    const cartId = body?.id;

    if (!cartId || typeof cartId !== "number") {
      return NextResponse.json(
        { error: "Invalid cart id" },
        { status: 400 },
      );
    }

    await setShopSessionTZ();

    const customerIdBig = BigInt(customerId);

    const result = await prismaShop.carts.updateMany({
      where: {
        id__customers: customerIdBig,
        id: BigInt(cartId),
        cart_status: 0,
        event_sale: CURRENT_EVENT_SALE as any,
      },
      data: {
        cart_status: 3, // 3 = deleted/cancelled (ตาม type ใน cart.ts)
        updated_at: new Date(),
      },
    });

    // ✅ หลังจากลบแล้ว คำนวณ summary ใหม่ส่งกลับไปให้ frontend
    const summary = await getCartSummary(customerId);

    return NextResponse.json(
      {
        status: "ok",
        affected: result.count,
        summary,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[api/cart/remove] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 },
    );
  }
}

// v.1.1.2 =============================================

// v.1.1.2 =============================================
// // src/app/api/cart/remove/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";

// type RemoveRequestBody = {
//   id: number;
// };

// export async function POST(req: NextRequest) {
//   try {
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) customerId = Number(decoded.sub);
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" }, { status: 200 });
//     }

//     const body = (await req.json()) as RemoveRequestBody | null;
//     const cartId = body?.id;

//     if (!cartId || typeof cartId !== "number") {
//       return NextResponse.json(
//         { error: "Invalid cart id" },
//         { status: 400 },
//       );
//     }

//     await setShopSessionTZ();

//     const customerIdBig = BigInt(customerId);

//     const result = await prismaShop.carts.updateMany({
//       where: {
//         id__customers: customerIdBig,
//         id: BigInt(cartId),
//         cart_status: 0,
//         event_sale: CURRENT_EVENT_SALE as any,
//       },
//       data: {
//         cart_status: 3, // 3 = deleted/cancelled (ตาม type ใน cart.ts)
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json(
//       {
//         status: "ok",
//         affected: result.count,
//       },
//       { status: 200 },
//     );
//   } catch (err: any) {
//     console.error("[api/cart/remove] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 },
//     );
//   }
// }

// v.1.1.2 =============================================

// // src/app/api/cart/remove/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { ids } = body ?? {};

//     if (!Array.isArray(ids) || ids.length === 0) {
//       return NextResponse.json(
//         { error: "Missing or invalid ids" },
//         { status: 400 }
//       );
//     }

//     // ================================
//     //   ตรวจสอบ token และ customerId
//     // ================================
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
//     let customerId: number | null = null;

//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) {
//         customerId = Number(decoded.sub);
//       }
//     }

//     if (!customerId) {
//       return NextResponse.json(
//         { status: "login" },
//         { status: 200 }
//       );
//     }

//     // ================================
//     //   Update cart_status = 3
//     // ================================
//     await setShopSessionTZ();

//     await prismaShop.carts.updateMany({
//       where: {
//         id__customers: BigInt(customerId),
//         id: {
//           in: ids.map((x: number | string) => BigInt(x)),
//         },
//         cart_status: 0,
//       },
//       data: {
//         cart_status: 3,
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json(
//       { status: "success" },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("[api/cart/remove] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }
